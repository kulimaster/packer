using FluentValidation;
using Packer.Domain.Templates;

namespace Packer.Application.Templates.DuplicateTemplate;

public sealed class DuplicateTemplateRequestValidator : AbstractValidator<DuplicateTemplateRequest>
{
    public DuplicateTemplateRequestValidator()
    {
        RuleFor(request => request.Name)
            .MaximumLength(Template.NameMaxLength)
            .When(request => !string.IsNullOrWhiteSpace(request.Name));
    }
}
