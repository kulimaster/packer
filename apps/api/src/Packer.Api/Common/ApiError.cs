using Packer.Application.Common.Exceptions;
using Packer.Domain.Common;

namespace Packer.Api.Common;

/// <summary>
/// Tvar chybové odpovědi podle docs/api-contract.md. Drží se i pro 500 – klient
/// tak nikdy nedostane HTML chybovou stránku.
/// </summary>
internal sealed record ApiError(
    string Code,
    string Message,
    IReadOnlyDictionary<string, string[]>? Errors = null);
