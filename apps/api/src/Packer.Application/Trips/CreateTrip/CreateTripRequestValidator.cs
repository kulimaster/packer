using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateTrip;

/// <summary>
/// Validuje vstup dřív, než se vytvoří entita – uživatel tak dostane všechny chyby najednou
/// (400 s <c>errors</c>), ne první výjimku z domény.
/// </summary>
public sealed class CreateTripRequestValidator : AbstractValidator<CreateTripRequest>
{
    public CreateTripRequestValidator()
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
