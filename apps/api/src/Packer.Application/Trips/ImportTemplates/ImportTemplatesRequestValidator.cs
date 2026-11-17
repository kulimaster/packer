using FluentValidation;

namespace Packer.Application.Trips.ImportTemplates;

public sealed class ImportTemplatesRequestValidator : AbstractValidator<ImportTemplatesRequest>
{
    public ImportTemplatesRequestValidator()
    {
        RuleFor(request => request.TemplateIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .NotEmpty()
            .WithMessage("Choose at least one template.")
            .Must(ids => ids!.Count <= 10)
            .WithMessage("Import at most 10 templates at once.")
            .Must(ids => ids!.Distinct().Count() == ids!.Count)
            .WithMessage("Template ids must be unique.");

        RuleForEach(request => request.TemplateIds)
            .NotEmpty()
            .WithMessage("Template ids must be real ids.");
    }
}
