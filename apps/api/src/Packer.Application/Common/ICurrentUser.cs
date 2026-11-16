namespace Packer.Application.Common;

/// <summary>
/// Přihlášený uživatel z cookie. <see cref="UserId"/> vyhodí
/// <see cref="Exceptions.UnauthenticatedException"/>, když požadavek není autentizovaný –
/// use case tak nemusí řešit <c>null</c> v každé metodě.
/// </summary>
public interface ICurrentUser
{
    Guid UserId { get; }
}
