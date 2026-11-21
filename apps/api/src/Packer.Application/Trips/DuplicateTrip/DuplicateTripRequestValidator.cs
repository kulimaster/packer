using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.DuplicateTrip;

public sealed class DuplicateTripRequestValidator : AbstractValidator<DuplicateTripRequest>
{
    public DuplicateTripRequestValidator()
    {
        RuleFor(request => request.Title)
            .MaximumLength(Trip.TitleMaxLength);
    }
}
