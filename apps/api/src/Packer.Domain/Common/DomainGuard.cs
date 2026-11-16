namespace Packer.Domain.Common;

/// <summary>
/// Hlídá invarianty, které se opakují napříč entitami (povinný text, délky, rozsahy).
/// Záměrně není veřejné – zvenčí se entity validují jen přes své tovární metody.
/// Chybové kódy mají tvar <c>{prefix}_required</c> / <c>{prefix}_too_long</c> / <c>{prefix}_out_of_range</c>,
/// takže je Api i frontend umí zobrazit bez parsování textu.
/// </summary>
internal static class DomainGuard
{
    public static string RequiredText(string? value, int maxLength, string codePrefix, string paramName)
    {
        var trimmed = value?.Trim();

        if (string.IsNullOrEmpty(trimmed))
        {
            throw new DomainException($"{codePrefix}_required", $"{paramName} must not be empty.");
        }

        if (trimmed.Length > maxLength)
        {
            throw new DomainException(
                $"{codePrefix}_too_long",
                $"{paramName} must be at most {maxLength} characters.");
        }

        return trimmed;
    }

    public static string? OptionalText(string? value, int maxLength, string codePrefix, string paramName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();

        if (trimmed.Length > maxLength)
        {
            throw new DomainException(
                $"{codePrefix}_too_long",
                $"{paramName} must be at most {maxLength} characters.");
        }

        return trimmed;
    }

    public static int AtLeast(int value, int min, string codePrefix, string paramName)
    {
        if (value < min)
        {
            throw new DomainException(
                $"{codePrefix}_out_of_range",
                $"{paramName} must be at least {min}.");
        }

        return value;
    }

    public static decimal? OptionalNonNegative(decimal? value, string codePrefix, string paramName)
    {
        if (value < 0)
        {
            throw new DomainException(
                $"{codePrefix}_out_of_range",
                $"{paramName} must not be negative.");
        }

        return value;
    }

    public static Guid RequiredId(Guid value, string codePrefix, string paramName)
    {
        if (value == Guid.Empty)
        {
            throw new DomainException($"{codePrefix}_required", $"{paramName} must be set.");
        }

        return value;
    }
}
