using FluentValidation;

namespace Packer.Application.Trips.AssignCategoryBag;

public sealed class AssignCategoryBagRequestValidator : AbstractValidator<AssignCategoryBagRequest>
{
    public AssignCategoryBagRequestValidator()
    {
        RuleFor(request => request.BagId)
            .Must(bagId => bagId != Guid.Empty)
            .When(request => request.BagId.HasValue)
            .WithMessage("BagId must be null or a real bag.");
    }
}
