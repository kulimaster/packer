namespace Packer.Application.Common.Exceptions;

/// <summary>Stav znemožňuje operaci (typicky editace archivovaného výletu) → HTTP 409.</summary>
public sealed class ConflictException : AppException
{
    public ConflictException(string code, string message)
        : base(code, message) { }
}
