using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateBag;

/// <summary>Úprava bagu. Pořadí se mění jen přes <c>MoveTo</c>, proto tu není.</summary>
public sealed record UpdateBagRequest(
    string? Name,
    BagKind Kind,
    decimal? AllowanceKg = null);
