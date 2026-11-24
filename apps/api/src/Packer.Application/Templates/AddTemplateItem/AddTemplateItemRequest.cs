using Packer.Domain.Trips;

namespace Packer.Application.Templates.AddTemplateItem;

/// <summary>
/// Položka přidávaná do vlastní šablony. Kategorie je jen název – po importu
/// se podle něj položka zařadí do existující nebo nové kategorie výletu.
/// </summary>
public sealed record AddTemplateItemRequest(
    string? CategoryName,
    string? Title,
    string? Note,
    int Quantity,
    bool IsEssential,
    ItemTraits Flags,
    int? WeightGrams);
