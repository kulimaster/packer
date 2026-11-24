using Packer.Domain.Trips;

namespace Packer.Application.Templates.UpdateTemplateItem;

/// <summary>Úprava položky šablony – pořadí ani kategorie šablony se nemění.</summary>
public sealed record UpdateTemplateItemRequest(
    string? CategoryName,
    string? Title,
    string? Note,
    int Quantity,
    bool IsEssential,
    ItemTraits Flags,
    int? WeightGrams);
