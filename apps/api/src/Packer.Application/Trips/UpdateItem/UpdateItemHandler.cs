using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateItem;

public sealed class UpdateItemHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<UpdateItemRequest> validator)
{
    public async Task<ItemDetails> HandleAsync(
        Guid itemId,
        UpdateItemRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var items = await db.ToListAsync(
            db.ItemsOwnedBy(currentUser.UserId).Where(item => item.Id == itemId),
            cancellationToken);

        var item = items.SingleOrDefault() ?? throw NotFoundException.For("item");

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => db.Categories.Any(category =>
                category.Id == item.CategoryId && category.TripId == trip.Id)),
            cancellationToken);

        var trip = trips.Single();

        // Přeskládání by změnilo celkovou hmotnost i progress – uvnitř archivovaného
        // výletu to zakáže až `Touch` (409 trip_archived).
        item.Update(
            request.Title,
            request.Note,
            request.Quantity,
            request.IsEssential,
            request.Flags,
            request.WeightGrams);

        trip.Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);

        return ItemDetails.From(item);
    }
}
