using FluentValidation.Results;

namespace Packer.Application.Common;

/// <summary>
/// Převod FluentValidation chyb do tvaru API odpovědi: klíč pole v camelCase
/// (JSON konvence), hodnota seznam zpráv. Víc chyb na jedno pole se neslévá.
/// </summary>
internal static class ValidationErrors
{
    public static Dictionary<string, string[]> From(ValidationResult result) =>
        result.Errors
            .GroupBy(failure => ToCamelCase(failure.PropertyName))
            .ToDictionary(
                group => group.Key,
                group => group.Select(failure => failure.ErrorMessage).ToArray());

    private static string ToCamelCase(string propertyName)
    {
        if (string.IsNullOrEmpty(propertyName) || char.IsLower(propertyName[0]))
        {
            return propertyName;
        }

        return char.ToLowerInvariant(propertyName[0]) + propertyName[1..];
    }
}
