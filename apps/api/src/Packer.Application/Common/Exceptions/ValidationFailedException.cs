namespace Packer.Application.Common.Exceptions;

/// <summary>
/// Vstup neprošel validací → HTTP 400. <see cref="Errors"/> má klíč = název pole
/// v camelCase, hodnotu = seznam zpráv (stejný tvar jako FluentValidation).
/// </summary>
public sealed class ValidationFailedException : AppException
{
    public ValidationFailedException(IReadOnlyDictionary<string, string[]> errors)
        : base("validation_failed", "Request validation failed.") => Errors = errors;

    public IReadOnlyDictionary<string, string[]> Errors { get; }
}
