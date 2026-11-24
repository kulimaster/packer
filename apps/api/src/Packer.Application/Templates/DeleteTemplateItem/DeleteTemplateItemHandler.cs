using Packer.Application.Common;
using Packer.Application.Common.Exceptions;

namespace Packer.Application.Templates.DeleteTemplateItem;

/// <summary>
/// Smazání položky vlastní šablony. Systémové a cizí šablony vracejí
/// <c>404 template_not_found</c>, položka z jiné šablony <c>404 template_item_not_found</c>.
/// </summary>
public sealed class DeleteTemplateItemHandler(IAppDbContext db, ICurrentUser currentUser)
{
    public async Task HandleAsync(Guid templateId, Guid itemId, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;

        var templates = await db.ToListAsync(
            db.Templates.Where(template => template.Id == templateId && template.OwnerId == userId),
            cancellationToken);

        _ = templates.SingleOrDefault() ?? throw NotFoundException.For("template");

        var items = await db.ToListAsync(
            db.TemplateItems.Where(item => item.Id == itemId && item.TemplateId == templateId),
            cancellationToken);

        var item = items.SingleOrDefault() ?? throw NotFoundException.For("template_item");

        db.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
    }
}
