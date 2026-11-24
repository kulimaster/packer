using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Application.Templates.GetTemplate;

namespace Packer.Application.Templates.UpdateTemplateItem;

/// <summary>
/// Úprava položky vlastní šablony. Položka z jiné šablony se tváří jako
/// neexistující – id se nesmí dát podstrčit pod cizí šablonu.
/// </summary>
public sealed class UpdateTemplateItemHandler(
    IAppDbContext db,
    ICurrentUser currentUser,
    IValidator<UpdateTemplateItemRequest> validator)
{
    public async Task<TemplateItemDetails> HandleAsync(
        Guid templateId,
        Guid itemId,
        UpdateTemplateItemRequest request,
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

        _ = templates.SingleOrDefault() ?? throw NotFoundException.For("template");

        var items = await db.ToListAsync(
            db.TemplateItems.Where(item => item.Id == itemId && item.TemplateId == templateId),
            cancellationToken);

        var item = items.SingleOrDefault() ?? throw NotFoundException.For("template_item");

        item.Update(
            request.CategoryName,
            request.Title,
            request.Note,
            request.Quantity,
            request.IsEssential,
            request.Flags,
            request.WeightGrams);

        await db.SaveChangesAsync(cancellationToken);

        return TemplateItemDetails.From(item);
    }
}
