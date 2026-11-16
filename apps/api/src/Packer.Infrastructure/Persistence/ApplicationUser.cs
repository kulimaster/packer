using Microsoft.AspNetCore.Identity;

namespace Packer.Infrastructure.Persistence;

/// <summary>
/// Uživatel = ASP.NET Identity uživatel + data, která o něm potřebujeme my.
/// Doménový model je v docs/domain-model.md (sekce User); zbytek polí drží Identity.
/// </summary>
public sealed class ApplicationUser : IdentityUser<Guid>
{
    public const int DisplayNameMaxLength = 80;

    public string DisplayName { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }
}
