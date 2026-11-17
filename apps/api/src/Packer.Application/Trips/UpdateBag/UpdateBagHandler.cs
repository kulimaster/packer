using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateBag;

public sealed class UpdateBagHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<UpdateBagRequest> validator)
{
    public async Task<BagDetails> HandleAsync(
        Guid bagId,
        UpdateBagRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var bags = await db.ToListAsync(
            db.BagsOwnedBy(currentUser.UserId).Where(bag => bag.Id == bagId),
            cancellationToken);

        var bag = bags.SingleOrDefault() ?? throw NotFoundException.For("bag");

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == bag.TripId),
            cancellationToken);

        var trip = trips.Single();

        bag.Update(request.Name, request.Kind, request.AllowanceKg);
        trip.Touch(clock.UtcNow);
        await db.SaveChangesAsync(cancellationToken);

        var weightGrams = await db.BagWeightGramsAsync(bag.Id, cancellationToken);

        return BagDetails.From(bag, weightGrams);
    }
}
