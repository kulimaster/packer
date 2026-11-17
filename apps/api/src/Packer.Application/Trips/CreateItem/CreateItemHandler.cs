using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateItem;

public sealed class CreateItemHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<CreateItemRequest> validator)
{
    public async Task<ItemDetails> HandleAsync(
        Guid categoryId,
        CreateItemRequest request,
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

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == category.TripId),
            cancellationToken);

        var trip = trips.Single();

        var positions = await db.ToListAsync(
            db.Items.Where(item => item.CategoryId == categoryId).Select(item => item.Position),
            cancellationToken);

        var position = positions.Count == 0 ? 0 : positions.Max() + 1;

        var item = Item.Create(
            categoryId,
            request.Title,
            request.Note,
            request.Quantity,
            request.IsEssential,
            request.Flags,
            request.WeightGrams,
            position);

        db.Add(item);
        trip.Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);

        return ItemDetails.From(item);
    }
}
