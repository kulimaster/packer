using Packer.Domain.Common;
using Packer.Domain.Trips;

namespace Packer.Domain.Templates;

/// <summary>
/// Položka šablony. Nemá <c>IsPacked</c> – šablona se nebalí, jen se z ní generují
/// položky výletu (viz "Import šablony" v docs/domain-model.md).
/// </summary>
public sealed class TemplateItem
{
    public const int CategoryNameMaxLength = 80;
    public const int TitleMaxLength = 120;
    public const int NoteMaxLength = 300;
    public const int QuantityMax = 999;
    public const int WeightGramsMax = 100_000;

    // Pro EF Core.
    private TemplateItem() { }

    public Guid Id { get; private set; }

    public Guid TemplateId { get; private set; }

    /// <summary>Do které kategorie se má položka po importu zařadit.</summary>
    public string CategoryName { get; private set; } = string.Empty;

    public string Title { get; private set; } = string.Empty;

    public string? Note { get; private set; }

    public int Quantity { get; private set; } = 1;

    public bool IsEssential { get; private set; }

    public ItemTraits Flags { get; private set; }

    public int? WeightGrams { get; private set; }

    public int Position { get; private set; }

    public static TemplateItem Create(
        Guid templateId,
        string? categoryName,
        string? title,
        string? note,
        int quantity,
        bool isEssential,
        ItemTraits flags,
        int? weightGrams,
        int position)
    {
        DomainGuard.RequiredId(templateId, "template_item_template", nameof(templateId));

        return new TemplateItem
        {
            Id = Guid.NewGuid(),
            TemplateId = templateId,
            CategoryName = DomainGuard.RequiredText(
                categoryName,
                CategoryNameMaxLength,
                "template_item_category",
                nameof(categoryName)),
            Title = DomainGuard.RequiredText(title, TitleMaxLength, "template_item_title", nameof(title)),
            Note = DomainGuard.OptionalText(note, NoteMaxLength, "template_item_note", nameof(note)),
            Quantity = ValidateQuantity(quantity),
            IsEssential = isEssential,
            Flags = flags,
            WeightGrams = ValidateWeight(weightGrams),
            Position = DomainGuard.AtLeast(position, 0, "template_item_position", nameof(position)),
        };
    }

    public void MoveTo(int position)
    {
        Position = DomainGuard.AtLeast(position, 0, "template_item_position", nameof(position));
    }

    /// <summary>Úprava obsahu položky; pořadí a příslušnost k šabloně zůstávají.</summary>
    public void Update(
        string? categoryName,
        string? title,
        string? note,
        int quantity,
        bool isEssential,
        ItemTraits flags,
        int? weightGrams)
    {
        CategoryName = DomainGuard.RequiredText(
            categoryName,
            CategoryNameMaxLength,
            "template_item_category",
            nameof(categoryName));
        Title = DomainGuard.RequiredText(title, TitleMaxLength, "template_item_title", nameof(title));
        Note = DomainGuard.OptionalText(note, NoteMaxLength, "template_item_note", nameof(note));
        Quantity = ValidateQuantity(quantity);
        IsEssential = isEssential;
        Flags = flags;
        WeightGrams = ValidateWeight(weightGrams);
    }

    private static int ValidateQuantity(int quantity)
    {
        if (quantity > QuantityMax)
        {
            throw new DomainException(
                "template_item_quantity_out_of_range",
                $"Quantity must be at most {QuantityMax}.");
        }

        return DomainGuard.AtLeast(quantity, 1, "template_item_quantity", nameof(quantity));
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
                "template_item_weight_out_of_range",
                $"Weight must be between 0 and {WeightGramsMax} grams.");
        }

        return weightGrams;
    }
}
