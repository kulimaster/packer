using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateCategory;

public sealed class UpdateCategoryRequestValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryRequestValidator()
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
    }
}
