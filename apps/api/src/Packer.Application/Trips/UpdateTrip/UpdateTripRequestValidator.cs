using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateTrip;

public sealed class UpdateTripRequestValidator : AbstractValidator<UpdateTripRequest>
{
    public UpdateTripRequestValidator()
    {
        RuleFor(request => request.Title)
            .NotEmpty()
            .MaximumLength(Trip.TitleMaxLength);

        RuleFor(request => request.Destination)
            .MaximumLength(Trip.DestinationMaxLength);

        RuleFor(request => request.CoverImage)
            .MaximumLength(Trip.CoverImageMaxLength);

        RuleFor(request => request.EndDate)
            .GreaterThanOrEqualTo(request => request.StartDate)
            .When(request => request.StartDate.HasValue && request.EndDate.HasValue)
            .WithMessage("End date must not be before start date.");
    }
}
