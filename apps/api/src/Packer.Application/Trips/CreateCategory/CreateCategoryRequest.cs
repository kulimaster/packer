namespace Packer.Application.Trips.CreateCategory;

/// <summary>Vstup pro založení kategorie. Výlet jde z route, pořadí dopočítá handler.</summary>
public sealed record CreateCategoryRequest(
    string? Name,
    string? Icon,
    string? Note,
    decimal? MaxWeightKg,
    Guid? BagId = null);
