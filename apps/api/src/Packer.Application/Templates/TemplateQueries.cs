using Packer.Application.Common;
using Packer.Domain.Templates;

namespace Packer.Application.Templates;

/// <summary>
/// Šablony viditelné uživateli: systémové (<c>OwnerId = null</c>) a jeho vlastní.
/// Cizí šablona se chová stejně jako neexistující – klient se nesmí dozvědět, že id patří jinému.
/// </summary>
internal static class TemplateQueries
{
    public static IQueryable<Template> TemplatesAvailableTo(this IAppDbContext db, Guid userId) =>
        db.Templates.Where(template => template.OwnerId == null || template.OwnerId == userId);
}
