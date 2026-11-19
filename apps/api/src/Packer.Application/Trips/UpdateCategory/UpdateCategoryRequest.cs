using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateCategory;

/// <summary>
/// Vstup pro úpravu kategorie. Bag se mění jen přes <c>AssignCategoryBag</c>,
/// pořadí přes samostatnou operaci – tady jde o název, ikonu, poznámku a limit.
/// </summary>
public sealed record UpdateCategoryRequest(
    string? Name,
    string? Icon,
    string? Note,
    decimal? MaxWeightKg);
