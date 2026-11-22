using FluentValidation;
using Packer.Domain.Templates;

namespace Packer.Application.Templates.CreateTemplate;

public sealed class CreateTemplateRequestValidator : AbstractValidator<CreateTemplateRequest>
{
    public CreateTemplateRequestValidator()
    {
        RuleFor(request => request.TripId)
            .NotEmpty();

        RuleFor(request => request.Name)
            .NotEmpty()
            .MaximumLength(Template.NameMaxLength);

        RuleFor(request => request.Description)
            .MaximumLength(Template.DescriptionMaxLength);

        RuleFor(request => request.Icon)
            .NotEmpty()
            .MaximumLength(Template.IconMaxLength);

        RuleFor(request => request.Accent)
            .NotEmpty()
            .MaximumLength(Template.AccentMaxLength);
    }
}
