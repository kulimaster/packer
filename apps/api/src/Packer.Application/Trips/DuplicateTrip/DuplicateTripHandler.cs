using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.DuplicateTrip;

/// <summary>
/// Zkopíruje výlet i s bagy, kategoriemi a položkami. Kopie je vždy aktivní
/// a všechny položky jsou nesbalené – jde o přípravu nové cesty, ne o přenos stavu.
/// Archivovanou předlohu kopírovat lze; copy-on-write je právě to, k čemu archiv je.
/// </summary>
public sealed class DuplicateTripHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<DuplicateTripRequest> validator)
{
    public async Task<TripSummary> HandleAsync(
        Guid tripId,
        DuplicateTripRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var userId = currentUser.UserId;

        var sources = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == tripId && trip.OwnerId == userId),
            cancellationToken);

        var source = sources.SingleOrDefault() ?? throw NotFoundException.For("trip");

        var now = clock.UtcNow;

        var copy = Trip.Create(
            userId,
            string.IsNullOrWhiteSpace(request.Title) ? source.Title : request.Title,
            source.Destination,
            source.CoverImage,
            source.StartDate,
            source.EndDate,
            now);

        db.Add(copy);

        var sourceBags = await db.ToListAsync(
            db.Bags
                .Where(bag => bag.TripId == source.Id)
                .OrderBy(bag => bag.Position),
            cancellationToken);

        // Kopie má vlastní bagy; kategorie se přemapují na nové id, ne na původní.
        var bagIds = new Dictionary<Guid, Guid>();

        foreach (var bag in sourceBags)
        {
            var copyBag = Bag.Create(
                copy.Id,
                bag.Name,
                bag.Kind,
                bag.AllowanceKg,
                bag.Position);

            db.Add(copyBag);
            bagIds[bag.Id] = copyBag.Id;
        }

        var sourceCategories = await db.ToListAsync(
            db.Categories
                .Where(category => category.TripId == source.Id)
                .OrderBy(category => category.Position),
            cancellationToken);

        var categoryIds = new Dictionary<Guid, Guid>();

        foreach (var category in sourceCategories)
        {
            Guid? bagId = category.BagId is { } sourceBagId
                && bagIds.TryGetValue(sourceBagId, out var copyBagId)
                    ? copyBagId
                    : null;

            var copyCategory = Category.Create(
                copy.Id,
                bagId,
                category.Name,
                category.Icon,
                category.Note,
                category.MaxWeightKg,
                category.Position);

            db.Add(copyCategory);
            categoryIds[category.Id] = copyCategory.Id;
        }

        var sourceCategoryIds = sourceCategories.Select(category => category.Id).ToList();

        var sourceItems = sourceCategoryIds.Count == 0
            ? []
            : await db.ToListAsync(
                db.Items
                    .Where(item => sourceCategoryIds.Contains(item.CategoryId))
                    .OrderBy(item => item.Position),
                cancellationToken);

        foreach (var item in sourceItems)
        {
            var copyItem = Item.Create(
                categoryIds[item.CategoryId],
                item.Title,
                item.Note,
                item.Quantity,
                item.IsEssential,
                item.Flags,
                item.WeightGrams,
                item.Position);

            db.Add(copyItem);
        }

        await db.SaveChangesAsync(cancellationToken);

        return new TripSummary(
            copy.Id,
            copy.Title,
            copy.Destination,
            copy.CoverImage,
            copy.StartDate,
            copy.EndDate,
            copy.IsArchived,
            TripStatusRules.Determine(copy.IsArchived, 0, sourceItems.Count),
            PackedCount: 0,
            TotalCount: sourceItems.Count);
    }
}
