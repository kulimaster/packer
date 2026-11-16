namespace Packer.Application.Common;

/// <summary>
/// Čas jako závislost. Nikde v kódu není <c>DateTimeOffset.UtcNow</c>,
/// aby se daly testovat archivace, stáří položek i expirace.
/// </summary>
public interface IClock
{
    DateTimeOffset UtcNow { get; }
}
