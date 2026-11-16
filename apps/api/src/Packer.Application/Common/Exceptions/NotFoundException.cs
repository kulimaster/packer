namespace Packer.Application.Common.Exceptions;

/// <summary>
/// Entita neexistuje <em>nebo</em> nepatří uživateli. Záměrně stejná odpověď –
/// cizí data se nemají prozrazovat (viz docs/api-contract.md).
/// </summary>
public sealed class NotFoundException : AppException
{
    private NotFoundException(string code, string message)
        : base(code, message) { }

    /// <param name="entityCode">Kód entity v jednotném čísle, např. <c>trip</c>.</param>
    public static NotFoundException For(string entityCode) =>
        new($"{entityCode}_not_found", $"{entityCode} was not found.");
}
