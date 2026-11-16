using Packer.Application.Common;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.GetTrips;

/// <param name="IncludeArchived">Archivované výlety se posílají, jen když o ně klient požádá.</param>
public sealed record GetTripsQuery(bool IncludeArchived = false);

public sealed class GetTripsHandler(IAppDbContext db, ICurrentUser currentUser)
{
    public async Task<IReadOnlyList<TripSummary>> HandleAsync(
        GetTripsQuery query,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;

        var trips = db.Trips.Where(trip => trip.OwnerId == userId);

        if (!query.IncludeArchived)
        {
            trips = trips.Where(trip => !trip.IsArchived);
        }

        var rows = await db.ToListAsync(
            trips
                .OrderBy(trip => trip.IsArchived)
                .ThenByDescending(trip => trip.UpdatedAt)
                .Select(trip => new TripSummary(
                    trip.Id,
                    trip.Title,
                    trip.Destination,
                    trip.CoverImage,
                    trip.StartDate,
                    trip.EndDate,
                    trip.IsArchived,
                    // Placeholder – stav se dopočítá až nad materializovanými počty,
                    // protože TripStatusRules se do SQL přeložit nedá.
                    TripStatus.NotStarted,
                    db.Items.Count(item =>
                        item.IsPacked
                        && db.Categories.Any(category =>
                            category.Id == item.CategoryId && category.TripId == trip.Id)),
                    db.Items.Count(item =>
                        db.Categories.Any(category =>
                            category.Id == item.CategoryId && category.TripId == trip.Id)))),
            cancellationToken);

        return rows
            .Select(row => row with
            {
                Status = TripStatusRules.Determine(row.IsArchived, row.PackedCount, row.TotalCount),
            })
            .ToList();
    }
}
