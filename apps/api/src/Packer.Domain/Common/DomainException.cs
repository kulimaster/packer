namespace Packer.Domain.Common;

/// <summary>
/// Porušení doménového pravidla. Nese stabilní <see cref="Code"/>, který Api mapuje
/// na strojově čitelný kód v chybové odpovědi.
/// </summary>
public sealed class DomainException : Exception
{
    private const string DefaultCode = "domain_rule_violated";

    public DomainException()
        : this(DefaultCode, "Domain rule was violated.") { }

    public DomainException(string message)
        : this(DefaultCode, message) { }

    public DomainException(string message, Exception innerException)
        : this(DefaultCode, message, innerException) { }

    public DomainException(string code, string message)
        : base(message) => Code = code;

    public DomainException(string code, string message, Exception innerException)
        : base(message, innerException) => Code = code;

    /// <summary>Strojově čitelný kód, např. <c>trip_title_required</c>.</summary>
    public string Code { get; }
}
