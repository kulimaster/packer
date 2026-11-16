using Packer.Domain.Common;

namespace Packer.Domain.Trips;

/// <summary>
/// Balicí sekce výletu ("Airplane Carry-on", "Electronics &amp; Tech").
/// <see cref="Icon"/> je klíč z frontendového registru ikon, ne obrázek v DB.
/// </summary>
public sealed class Category
{
    public const int NameMaxLength = 80;
    public const int IconMaxLength = 40;
    public const int NoteMaxLength = 200;
    public const decimal MaxWeightMaxKg = 100m;

    private readonly List<Item> _items = [];

    // Pro EF Core.
    private Category() { }

    public Guid Id { get; private set; }

    public Guid TripId { get; private set; }

    /// <summary>Volitelné přiřazení k bagu; <c>null</c> = kategorie zatím do žádného bagu nepatří.</summary>
    public Guid? BagId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string Icon { get; private set; } = string.Empty;

    public string? Note { get; private set; }

    public decimal? MaxWeightKg { get; private set; }

    public int Position { get; private set; }

    public IReadOnlyCollection<Item> Items => _items;

    public static Category Create(
        Guid tripId,
        Guid? bagId,
        string? name,
        string? icon,
        string? note,
        decimal? maxWeightKg,
        int position)
    {
        DomainGuard.RequiredId(tripId, "category_trip", nameof(tripId));

        if (bagId == Guid.Empty)
        {
            throw new DomainException("category_bag_required", "BagId must be either null or a real bag.");
        }

        return new Category
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            BagId = bagId,
            Name = DomainGuard.RequiredText(name, NameMaxLength, "category_name", nameof(name)),
            Icon = DomainGuard.RequiredText(icon, IconMaxLength, "category_icon", nameof(icon)),
            Note = DomainGuard.OptionalText(note, NoteMaxLength, "category_note", nameof(note)),
            MaxWeightKg = ValidateMaxWeight(maxWeightKg),
            Position = DomainGuard.AtLeast(position, 0, "category_position", nameof(position)),
        };
    }

    public void Update(
        Guid? bagId,
        string? name,
        string? icon,
        string? note,
        decimal? maxWeightKg)
    {
        if (bagId == Guid.Empty)
        {
            throw new DomainException("category_bag_required", "BagId must be either null or a real bag.");
        }

        BagId = bagId;
        Name = DomainGuard.RequiredText(name, NameMaxLength, "category_name", nameof(name));
        Icon = DomainGuard.RequiredText(icon, IconMaxLength, "category_icon", nameof(icon));
        Note = DomainGuard.OptionalText(note, NoteMaxLength, "category_note", nameof(note));
        MaxWeightKg = ValidateMaxWeight(maxWeightKg);
    }

    public void MoveTo(int position)
    {
        Position = DomainGuard.AtLeast(position, 0, "category_position", nameof(position));
    }

    private static decimal? ValidateMaxWeight(decimal? maxWeightKg)
    {
        var value = DomainGuard.OptionalNonNegative(maxWeightKg, "category_max_weight", nameof(maxWeightKg));

        if (value > MaxWeightMaxKg)
        {
            throw new DomainException(
                "category_max_weight_out_of_range",
                $"Max weight must be at most {MaxWeightMaxKg} kg.");
        }

        return value;
    }
}
