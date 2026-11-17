using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateBag;

public sealed class UpdateBagRequestValidator : AbstractValidator<UpdateBagRequest>
{
    public UpdateBagRequestValidator()
    {
        RuleFor(request => request.Name)
            .NotEmpty()
            .MaximumLength(Bag.NameMaxLength);

        RuleFor(request => request.Kind)
            .IsInEnum();

        RuleFor(request => request.AllowanceKg)
            .InclusiveBetween(0, Bag.AllowanceMaxKg)
            .When(request => request.AllowanceKg.HasValue);
    }
}
