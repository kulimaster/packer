using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Application.Templates.GetTemplates;
using Packer.Domain.Templates;

namespace Packer.Application.Templates.DuplicateTemplate;

/// <summary>
/// Zkopíruje šablonu do vlastnictví přihlášeného uživatele. Duplikovat jde
/// i systémovou šablonu – právě tím vznikne editovatelná kopie. Cizí šablona
/// se tváří jako neexistující.
/// </summary>
public sealed class DuplicateTemplateHandler(
    IAppDbContext db,
    ICurrentUser currentUser,
    IValidator<DuplicateTemplateRequest> validator)
{
    public async Task<TemplateSummary> HandleAsync(
        Guid templateId,
        DuplicateTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var userId = currentUser.UserId;

        var sources = await db.ToListAsync(
            db.Templates.Where(template =>
                template.Id == templateId
                && (template.OwnerId == null || template.OwnerId == userId)),
            cancellationToken);

        var source = sources.SingleOrDefault() ?? throw NotFoundException.For("template");

        var sourceItems = await db.ToListAsync(
            db.TemplateItems
                .Where(item => item.TemplateId == source.Id)
                .OrderBy(item => item.Position),
            cancellationToken);

        var copy = Template.Create(
            userId,
            string.IsNullOrWhiteSpace(request.Name) ? source.Name : request.Name,
            source.Description,
            source.Icon,
            source.Accent);

        // Kopírujeme přes doménový AddItem, aby si kopie přepočítala pořadí od nuly.
        foreach (var item in sourceItems)
        {
            copy.AddItem(
                item.CategoryName,
                item.Title,
                item.Note,
                item.Quantity,
                item.IsEssential,
                item.Flags,
                item.WeightGrams);
        }

        db.Add(copy);
        await db.SaveChangesAsync(cancellationToken);

        return TemplateSummary.From(copy, copy.Items.ToList());
    }
}
