using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.SetItemPacked;

public sealed class SetItemPackedHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser)
{
    public async Task<ItemDetails> HandleAsync(
        Guid itemId,
        bool isPacked,
        CancellationToken cancellationToken)
    {
        var items = await db.ToListAsync(
            db.ItemsOwnedBy(currentUser.UserId).Where(item => item.Id == itemId),
            cancellationToken);

        var item = items.SingleOrDefault() ?? throw NotFoundException.For("item");

        if (item.IsPacked != isPacked)
        {
            var now = clock.UtcNow;
            item.SetPacked(isPacked, now);

            var trips = await db.ToListAsync(
                db.Trips.Where(trip => db.Categories.Any(category =>
                    category.Id == item.CategoryId && category.TripId == trip.Id)),
                cancellationToken);

            trips.Single().Touch(now);
            await db.SaveChangesAsync(cancellationToken);
        }

        return ItemDetails.From(item);
    }
}
