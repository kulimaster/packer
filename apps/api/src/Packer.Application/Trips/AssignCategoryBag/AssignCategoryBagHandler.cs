using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.AssignCategoryBag;

public sealed class AssignCategoryBagHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<AssignCategoryBagRequest> validator)
{
    public async Task<CategoryDetails> HandleAsync(
        Guid categoryId,
        AssignCategoryBagRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var categories = await db.ToListAsync(
            db.CategoriesOwnedBy(currentUser.UserId).Where(category => category.Id == categoryId),
            cancellationToken);

        var category = categories.SingleOrDefault() ?? throw NotFoundException.For("category");

        if (request.BagId is { } bagId)
        {
            // Bag musí patřit ke stejnému výletu – jinak by šlo kategorii přiřadit k cizímu výletu.
            var bags = await db.ToListAsync(
                db.Bags
                    .Where(bag => bag.Id == bagId && bag.TripId == category.TripId)
                    .Select(bag => bag.Id),
                cancellationToken);

            if (bags.Count == 0)
            {
                throw NotFoundException.For("bag");
            }
        }

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == category.TripId),
            cancellationToken);

        var items = await db.ToListAsync(
            db.Items
                .Where(item => item.CategoryId == categoryId)
                .OrderBy(item => item.Position),
            cancellationToken);

        category.AssignToBag(request.BagId);
        trips.Single().Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);

        return CategoryDetails.From(category, items);
    }
}
