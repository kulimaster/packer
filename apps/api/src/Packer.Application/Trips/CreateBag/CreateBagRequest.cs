using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateBag;

/// <summary>Vstup pro založení bagu. Výlet jde z route, pořadí dopočítá handler.</summary>
public sealed record CreateBagRequest(
    string? Name,
    BagKind Kind,
    decimal? AllowanceKg = null);
