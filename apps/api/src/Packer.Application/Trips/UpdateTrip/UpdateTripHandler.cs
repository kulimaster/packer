using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateTrip;

public sealed class UpdateTripHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<UpdateTripRequest> validator)
{
    public async Task<TripSummary> HandleAsync(
        Guid tripId,
        UpdateTripRequest request,
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

        // Archivovaný výlet je jen ke čtení – doména vyhodí `trip_archived` (409).
        trip.Update(
            request.Title,
            request.Destination,
            request.CoverImage,
            request.StartDate,
            request.EndDate,
            clock.UtcNow);

        await db.SaveChangesAsync(cancellationToken);

        var counters = await db.ToListAsync(
            db.Trips
                .Where(candidate => candidate.Id == tripId)
                .Select(candidate => new
                {
                    PackedCount = db.Items.Count(item =>
                        item.IsPacked
                        && db.Categories.Any(category =>
                            category.Id == item.CategoryId && category.TripId == candidate.Id)),
                    TotalCount = db.Items.Count(item =>
                        db.Categories.Any(category =>
                            category.Id == item.CategoryId && category.TripId == candidate.Id)),
                }),
            cancellationToken);

        var counts = counters.Single();

        return new TripSummary(
            trip.Id,
            trip.Title,
            trip.Destination,
            trip.CoverImage,
            trip.StartDate,
            trip.EndDate,
            trip.IsArchived,
            TripStatusRules.Determine(trip.IsArchived, counts.PackedCount, counts.TotalCount),
            counts.PackedCount,
            counts.TotalCount);
    }
}
