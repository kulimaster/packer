using Packer.Application.Common;
using Packer.Application.Common.Exceptions;

namespace Packer.Application.Templates.DeleteTemplate;

/// <summary>
/// Smaže vlastní šablonu i s položkami (kaskáda na FK). Systémové šablony jsou pro uživatele
/// neexistující, stejně jako cizí.
/// </summary>
public sealed class DeleteTemplateHandler(IAppDbContext db, ICurrentUser currentUser)
{
    public async Task HandleAsync(Guid templateId, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;

        var templates = await db.ToListAsync(
            db.Templates.Where(template => template.Id == templateId && template.OwnerId == userId),
            cancellationToken);

        var template = templates.SingleOrDefault() ?? throw NotFoundException.For("template");

        db.Remove(template);
        await db.SaveChangesAsync(cancellationToken);
    }
}
