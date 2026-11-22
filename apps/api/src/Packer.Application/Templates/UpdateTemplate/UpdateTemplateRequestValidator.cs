using FluentValidation;
using Packer.Domain.Templates;

namespace Packer.Application.Templates.UpdateTemplate;

public sealed class UpdateTemplateRequestValidator : AbstractValidator<UpdateTemplateRequest>
{
    public UpdateTemplateRequestValidator()
    {
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
