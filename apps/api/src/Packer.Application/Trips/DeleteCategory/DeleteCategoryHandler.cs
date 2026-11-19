using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.DeleteCategory;

public sealed class DeleteCategoryHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser)
{
    public async Task HandleAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        var categories = await db.ToListAsync(
            db.CategoriesOwnedBy(currentUser.UserId).Where(category => category.Id == categoryId),
            cancellationToken);

        var category = categories.SingleOrDefault() ?? throw NotFoundException.For("category");

        // FK má Cascade, ale načtené položky by EF nechal v kontextu – smažou se explicitně.
        var items = await db.ToListAsync(
            db.Items.Where(item => item.CategoryId == categoryId),
            cancellationToken);

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == category.TripId),
            cancellationToken);

        foreach (var item in items)
        {
            db.Remove(item);
        }

        db.Remove(category);
        trips.Single().Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);
    }
}
