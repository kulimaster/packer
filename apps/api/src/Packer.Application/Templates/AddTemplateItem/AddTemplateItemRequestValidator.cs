using FluentValidation;
using Packer.Domain.Templates;

namespace Packer.Application.Templates.AddTemplateItem;

public sealed class AddTemplateItemRequestValidator : AbstractValidator<AddTemplateItemRequest>
{
    public AddTemplateItemRequestValidator()
    {
        RuleFor(request => request.CategoryName)
            .NotEmpty()
            .MaximumLength(TemplateItem.CategoryNameMaxLength);

        RuleFor(request => request.Title)
            .NotEmpty()
            .MaximumLength(TemplateItem.TitleMaxLength);

        RuleFor(request => request.Note)
            .MaximumLength(TemplateItem.NoteMaxLength);

        RuleFor(request => request.Quantity)
            .InclusiveBetween(1, TemplateItem.QuantityMax);

        RuleFor(request => request.WeightGrams)
            .InclusiveBetween(0, TemplateItem.WeightGramsMax)
            .When(request => request.WeightGrams.HasValue);
    }
}
