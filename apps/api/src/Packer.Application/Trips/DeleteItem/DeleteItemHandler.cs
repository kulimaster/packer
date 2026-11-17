using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.DeleteItem;

public sealed class DeleteItemHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser)
{
    public async Task HandleAsync(Guid itemId, CancellationToken cancellationToken)
    {
        var items = await db.ToListAsync(
            db.ItemsOwnedBy(currentUser.UserId).Where(item => item.Id == itemId),
            cancellationToken);

        var item = items.SingleOrDefault() ?? throw NotFoundException.For("item");

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => db.Categories.Any(category =>
                category.Id == item.CategoryId && category.TripId == trip.Id)),
            cancellationToken);

        var trip = trips.Single();

        db.Remove(item);
        trip.Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);
    }
}
