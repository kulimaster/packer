using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateCategory;

public sealed class UpdateCategoryHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<UpdateCategoryRequest> validator)
{
    public async Task<CategoryDetails> HandleAsync(
        Guid categoryId,
        UpdateCategoryRequest request,
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

        var items = await db.ToListAsync(
            db.Items
                .Where(item => item.CategoryId == categoryId)
                .OrderBy(item => item.Position),
            cancellationToken);

        // Bag zůstává – ten má vlastní endpoint. Uvnitř archivovaného výletu
        // úpravu odmítne až `Touch` (409 trip_archived).
        category.Update(
            category.BagId,
            request.Name,
            request.Icon,
            request.Note,
            request.MaxWeightKg);

        trips.Single().Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);

        return CategoryDetails.From(category, items);
    }
}
