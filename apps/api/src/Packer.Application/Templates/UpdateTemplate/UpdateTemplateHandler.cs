using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Application.Templates.GetTemplates;
using Packer.Domain.Templates;

namespace Packer.Application.Templates.UpdateTemplate;

/// <summary>
/// Upravit jde jen vlastní šablona. Systémová ani cizí se pro uživatele tváří jako neexistující –
/// klient se nesmí dozvědět, že id patří někomu jinému.
/// </summary>
public sealed class UpdateTemplateHandler(
    IAppDbContext db,
    ICurrentUser currentUser,
    IValidator<UpdateTemplateRequest> validator)
{
    public async Task<TemplateSummary> HandleAsync(
        Guid templateId,
        UpdateTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var userId = currentUser.UserId;

        var templates = await db.ToListAsync(
            db.Templates.Where(template => template.Id == templateId && template.OwnerId == userId),
            cancellationToken);

        var template = templates.SingleOrDefault() ?? throw NotFoundException.For("template");

        template.Update(request.Name, request.Description, request.Icon, request.Accent);

        await db.SaveChangesAsync(cancellationToken);

        var items = await db.ToListAsync(
            db.TemplateItems
                .Where(item => item.TemplateId == templateId)
                .OrderBy(item => item.Position),
            cancellationToken);

        return TemplateSummary.From(template, items);
    }
}
