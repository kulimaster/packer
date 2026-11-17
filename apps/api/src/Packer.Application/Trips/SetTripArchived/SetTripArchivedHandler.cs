using Packer.Application.Common;
using Packer.Application.Common.Exceptions;

namespace Packer.Application.Trips.SetTripArchived;

public sealed class SetTripArchivedHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser)
{
    public async Task HandleAsync(
        Guid tripId,
        bool isArchived,
        CancellationToken cancellationToken)
    {
        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == tripId && trip.OwnerId == currentUser.UserId),
            cancellationToken);

        var trip = trips.SingleOrDefault() ?? throw NotFoundException.For("trip");

        if (isArchived)
        {
            trip.Archive(clock.UtcNow);
        }
        else
        {
            trip.Unarchive(clock.UtcNow);
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
