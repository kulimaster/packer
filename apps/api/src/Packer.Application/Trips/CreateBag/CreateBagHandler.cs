using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateBag;

public sealed class CreateBagHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<CreateBagRequest> validator)
{
    public async Task<BagDetails> HandleAsync(
        Guid tripId,
        CreateBagRequest request,
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

        var positions = await db.ToListAsync(
            db.Bags.Where(bag => bag.TripId == tripId).Select(bag => bag.Position),
            cancellationToken);

        var position = positions.Count == 0 ? 0 : positions.Max() + 1;

        var bag = Bag.Create(tripId, request.Name, request.Kind, request.AllowanceKg, position);

        db.Add(bag);
        trip.Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);

        // Nový bag je prázdný, takže hmotnost je nula a není co dočítat.
        return BagDetails.From(bag, 0);
    }
}
