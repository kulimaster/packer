namespace Packer.Application.Common.Exceptions;

/// <summary>Požadavek nemá přihlášeného uživatele → HTTP 401.</summary>
public sealed class UnauthenticatedException : AppException
{
    public UnauthenticatedException()
        : base("unauthenticated", "User is not authenticated.") { }
}
