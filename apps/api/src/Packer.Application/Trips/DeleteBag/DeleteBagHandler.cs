using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.DeleteBag;

public sealed class DeleteBagHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser)
{
    public async Task HandleAsync(Guid bagId, CancellationToken cancellationToken)
    {
        var bags = await db.ToListAsync(
            db.BagsOwnedBy(currentUser.UserId).Where(bag => bag.Id == bagId),
            cancellationToken);

        var bag = bags.SingleOrDefault() ?? throw NotFoundException.For("bag");

        // FK je SetNull, ale kategorie jsou načtené v kontextu – musí se odpojit explicitně,
        // jinak by je EF nechal ukazovat na smazaný bag.
        var categories = await db.ToListAsync(
            db.Categories.Where(category => category.BagId == bag.Id),
            cancellationToken);

        foreach (var category in categories)
        {
            category.AssignToBag(null);
        }

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == bag.TripId),
            cancellationToken);

        db.Remove(bag);
        trips.Single().Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);
    }
}
