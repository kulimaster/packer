using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Application.Templates.GetTemplate;

namespace Packer.Application.Templates.AddTemplateItem;

/// <summary>
/// Přidání položky do vlastní šablony. Systémová ani cizí šablona se tváří jako
/// neexistující, stejně jako u úpravy šablony.
/// </summary>
public sealed class AddTemplateItemHandler(
    IAppDbContext db,
    ICurrentUser currentUser,
    IValidator<AddTemplateItemRequest> validator)
{
    public async Task<TemplateItemDetails> HandleAsync(
        Guid templateId,
        AddTemplateItemRequest request,
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

        var item = template.AddItem(
            request.CategoryName,
            request.Title,
            request.Note,
            request.Quantity,
            request.IsEssential,
            request.Flags,
            request.WeightGrams);

        // Entity má Id z domény, takže EF by ho v tracked kolekci považoval za Modified.
        // Explicitní Add ho zapíše jako nový řádek.
        db.Add(item);

        await db.SaveChangesAsync(cancellationToken);

        return TemplateItemDetails.From(item);
    }
}
