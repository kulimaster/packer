using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateItem;

/// <summary>Vstup pro přidání položky. Kategorie jde z route, pořadí dopočítá handler.</summary>
public sealed record CreateItemRequest(
    string? Title,
    string? Note,
    int Quantity,
    bool IsEssential,
    ItemTraits Flags,
    int? WeightGrams);
