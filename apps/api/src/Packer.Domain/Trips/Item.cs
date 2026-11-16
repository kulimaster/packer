using Packer.Domain.Common;

namespace Packer.Domain.Trips;

/// <summary>
/// Položka balicího seznamu. <see cref="WeightGrams"/> je hmotnost jednoho kusu,
/// celková hmotnost položky je <c>WeightGrams * Quantity</c> (počítá se, neukládá).
/// </summary>
public sealed class Item
{
    public const int TitleMaxLength = 120;
    public const int NoteMaxLength = 300;
    public const int QuantityMax = 999;
    public const int WeightGramsMax = 100_000;

    // Pro EF Core.
    private Item() { }

    public Guid Id { get; private set; }

    public Guid CategoryId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string? Note { get; private set; }

    public int Quantity { get; private set; } = 1;

    public bool IsEssential { get; private set; }

    public ItemTraits Flags { get; private set; }

    public int? WeightGrams { get; private set; }

    public bool IsPacked { get; private set; }

    public DateTimeOffset? PackedAt { get; private set; }

    public int Position { get; private set; }

    public static Item Create(
        Guid categoryId,
        string? title,
        string? note,
        int quantity,
        bool isEssential,
        ItemTraits flags,
        int? weightGrams,
        int position)
    {
        DomainGuard.RequiredId(categoryId, "item_category", nameof(categoryId));

        return new Item
        {
            Id = Guid.NewGuid(),
            CategoryId = categoryId,
            Title = DomainGuard.RequiredText(title, TitleMaxLength, "item_title", nameof(title)),
            Note = DomainGuard.OptionalText(note, NoteMaxLength, "item_note", nameof(note)),
            Quantity = ValidateQuantity(quantity),
            IsEssential = isEssential,
            Flags = flags,
            WeightGrams = ValidateWeight(weightGrams),
            IsPacked = false,
            PackedAt = null,
            Position = DomainGuard.AtLeast(position, 0, "item_position", nameof(position)),
        };
    }

    public void Update(
        string? title,
        string? note,
        int quantity,
        bool isEssential,
        ItemTraits flags,
        int? weightGrams)
    {
        Title = DomainGuard.RequiredText(title, TitleMaxLength, "item_title", nameof(title));
        Note = DomainGuard.OptionalText(note, NoteMaxLength, "item_note", nameof(note));
        Quantity = ValidateQuantity(quantity);
        IsEssential = isEssential;
        Flags = flags;
        WeightGrams = ValidateWeight(weightGrams);
    }

    /// <summary>
    /// Přebalení / vrácení zpět. <see cref="PackedAt"/> je vyplněné právě tehdy,
    /// když je položka přebalená – jinak by se čas dal omylem "zapomenout" a UI by lhalo.
    /// </summary>
    public void SetPacked(bool isPacked, DateTimeOffset now)
    {
        if (isPacked == IsPacked)
        {
            return;
        }

        IsPacked = isPacked;
        PackedAt = isPacked ? now : null;
    }

    public void MoveTo(int position)
    {
        Position = DomainGuard.AtLeast(position, 0, "item_position", nameof(position));
    }

    private static int ValidateQuantity(int quantity)
    {
        if (quantity > QuantityMax)
        {
            throw new DomainException("item_quantity_out_of_range", $"Quantity must be at most {QuantityMax}.");
        }

        return DomainGuard.AtLeast(quantity, 1, "item_quantity", nameof(quantity));
    }

    private static int? ValidateWeight(int? weightGrams)
    {
        if (weightGrams is null)
        {
            return null;
        }

        if (weightGrams < 0 || weightGrams > WeightGramsMax)
        {
            throw new DomainException(
                "item_weight_out_of_range",
                $"Weight must be between 0 and {WeightGramsMax} grams.");
        }

        return weightGrams;
    }
}
