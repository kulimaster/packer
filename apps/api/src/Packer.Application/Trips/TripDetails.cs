using Packer.Domain.Trips;

namespace Packer.Application.Trips;

/// <summary>
/// Detail výletu včetně kategorií, položek a bagů. Všechny počty a hmotnosti jsou odvozené
/// (viz docs/domain-model.md) – nikdy se neukládají.
/// </summary>
public sealed record TripDetails(
    Guid Id,
    string Title,
    string? Destination,
    string? CoverImage,
    DateOnly? StartDate,
    DateOnly? EndDate,
    bool IsArchived,
    TripStatus Status,
    int PackedCount,
    int TotalCount,
    int EstimatedWeightGrams,
    IReadOnlyList<BagDetails> Bags,
    IReadOnlyList<CategoryDetails> Categories);

public sealed record BagDetails(
    Guid Id,
    string Name,
    BagKind Kind,
    decimal? AllowanceKg,
    int Position,
    int EstimatedWeightGrams)
{
    public static BagDetails From(Bag bag, int estimatedWeightGrams) =>
        new(
            bag.Id,
            bag.Name,
            bag.Kind,
            bag.AllowanceKg,
            bag.Position,
            estimatedWeightGrams);
}

public sealed record CategoryDetails(
    Guid Id,
    Guid? BagId,
    string Name,
    string Icon,
    string? Note,
    decimal? MaxWeightKg,
    int Position,
    int PackedCount,
    int TotalCount,
    int EstimatedWeightGrams,
    IReadOnlyList<ItemDetails> Items)
{
    public static CategoryDetails From(Category category, IReadOnlyList<Item> items)
    {
        var itemDetails = items
            .OrderBy(item => item.Position)
            .Select(ItemDetails.From)
            .ToList();

        return new CategoryDetails(
            category.Id,
            category.BagId,
            category.Name,
            category.Icon,
            category.Note,
            category.MaxWeightKg,
            category.Position,
            itemDetails.Count(item => item.IsPacked),
            itemDetails.Count,
            itemDetails.Sum(item => item.EstimatedWeightGrams),
            itemDetails);
    }
}

public sealed record ItemDetails(
    Guid Id,
    string Title,
    string? Note,
    int Quantity,
    bool IsEssential,
    ItemTraits Flags,
    int? WeightGrams,
    bool IsPacked,
    DateTimeOffset? PackedAt,
    int Position,
    int EstimatedWeightGrams)
{
    public static ItemDetails From(Item item) =>
        new(
            item.Id,
            item.Title,
            item.Note,
            item.Quantity,
            item.IsEssential,
            item.Flags,
            item.WeightGrams,
            item.IsPacked,
            item.PackedAt,
            item.Position,
            (item.WeightGrams ?? 0) * item.Quantity);
}
