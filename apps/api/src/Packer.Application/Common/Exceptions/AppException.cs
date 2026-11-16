namespace Packer.Application.Common.Exceptions;

/// <summary>
/// Základ chyb, které umí Application pojmenovat. Nese stabilní <see cref="Code"/>;
/// mapování na HTTP status dělá Api, Application o HTTP neví.
/// </summary>
public abstract class AppException : Exception
{
    protected AppException(string code, string message)
        : base(message) => Code = code;

    /// <summary>Strojově čitelný kód, např. <c>trip_not_found</c>.</summary>
    public string Code { get; }
}
