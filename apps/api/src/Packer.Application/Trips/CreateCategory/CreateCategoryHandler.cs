using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateCategory;

public sealed class CreateCategoryHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<CreateCategoryRequest> validator)
{
    public async Task<CategoryDetails> HandleAsync(
        Guid tripId,
        CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == tripId && trip.OwnerId == currentUser.UserId),
            cancellationToken);

        var trip = trips.SingleOrDefault() ?? throw NotFoundException.For("trip");

        if (request.BagId is { } bagId)
        {
            var bags = await db.ToListAsync(
                db.Bags.Where(bag => bag.Id == bagId && bag.TripId == tripId).Select(bag => bag.Id),
                cancellationToken);

            if (bags.Count == 0)
            {
                throw NotFoundException.For("bag");
            }
        }

        var positions = await db.ToListAsync(
            db.Categories.Where(category => category.TripId == tripId).Select(category => category.Position),
            cancellationToken);

        var position = positions.Count == 0 ? 0 : positions.Max() + 1;

        var category = Category.Create(
            tripId,
            request.BagId,
            request.Name,
            request.Icon,
            request.Note,
            request.MaxWeightKg,
            position);

        db.Add(category);
        trip.Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);

        return CategoryDetails.From(category, []);
    }
}
