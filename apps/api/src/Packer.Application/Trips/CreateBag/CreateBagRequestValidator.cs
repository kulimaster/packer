using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateBag;

public sealed class CreateBagRequestValidator : AbstractValidator<CreateBagRequest>
{
    public CreateBagRequestValidator()
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
