using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateItem;

/// <summary>Vstup pro úpravu položky. Kategorie ani pořadí se nemění – to řeší jiné operace.</summary>
public sealed record UpdateItemRequest(
    string? Title,
    string? Note,
    int Quantity,
    bool IsEssential,
    ItemTraits Flags,
    int? WeightGrams);
