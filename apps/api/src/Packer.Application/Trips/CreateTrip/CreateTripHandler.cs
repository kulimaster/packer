using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateTrip;

public sealed class CreateTripHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<CreateTripRequest> validator)
{
    public async Task<TripSummary> HandleAsync(
        CreateTripRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var trip = Trip.Create(
            currentUser.UserId,
            request.Title,
            request.Destination,
            request.CoverImage,
            request.StartDate,
            request.EndDate,
            clock.UtcNow);

        db.Add(trip);
        await db.SaveChangesAsync(cancellationToken);

        return new TripSummary(
            trip.Id,
            trip.Title,
            trip.Destination,
            trip.CoverImage,
            trip.StartDate,
            trip.EndDate,
            trip.IsArchived,
            TripStatus.NotStarted,
            PackedCount: 0,
            TotalCount: 0);
    }
}
