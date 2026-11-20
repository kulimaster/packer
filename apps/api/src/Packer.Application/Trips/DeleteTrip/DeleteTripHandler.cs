using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.DeleteTrip;

public sealed class DeleteTripHandler(
    IAppDbContext db,
    ICurrentUser currentUser)
{
    public async Task HandleAsync(Guid tripId, CancellationToken cancellationToken)
    {
        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == tripId && trip.OwnerId == currentUser.UserId),
            cancellationToken);

        var trip = trips.SingleOrDefault() ?? throw NotFoundException.For("trip");

        // Kategorie, položky i bagy maže kaskáda na FK (nejsou načtené v kontextu).
        db.Remove(trip);
        await db.SaveChangesAsync(cancellationToken);
    }
}
