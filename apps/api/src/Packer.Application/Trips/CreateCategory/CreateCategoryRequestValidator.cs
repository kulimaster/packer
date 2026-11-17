using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateCategory;

public sealed class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(request => request.Name)
            .NotEmpty()
            .MaximumLength(Category.NameMaxLength);

        RuleFor(request => request.Icon)
            .NotEmpty()
            .MaximumLength(Category.IconMaxLength);

        RuleFor(request => request.Note)
            .MaximumLength(Category.NoteMaxLength);

        RuleFor(request => request.MaxWeightKg)
            .InclusiveBetween(0, Category.MaxWeightMaxKg)
            .When(request => request.MaxWeightKg.HasValue);

        RuleFor(request => request.BagId)
            .Must(bagId => bagId != Guid.Empty)
            .When(request => request.BagId.HasValue)
            .WithMessage("BagId must be null or a real bag.");
    }
}
