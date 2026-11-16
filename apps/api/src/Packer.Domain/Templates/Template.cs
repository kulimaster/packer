using Packer.Domain.Common;

namespace Packer.Domain.Templates;

/// <summary>
/// Znovupoužitelný kit ("Airplane Carry-on", 8 items).
/// <see cref="OwnerId"/> = <c>null</c> znamená systémovou šablonu dostupnou všem uživatelům;
/// systémové šablony se zakládají seedem v migraci, ne z API.
/// </summary>
public sealed class Template
{
    public const int NameMaxLength = 80;
    public const int DescriptionMaxLength = 160;
    public const int IconMaxLength = 40;
    public const int AccentMaxLength = 32;

    private readonly List<TemplateItem> _items = [];

    // Pro EF Core.
    private Template() { }

    public Guid Id { get; private set; }

    public Guid? OwnerId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    /// <summary>Klíč ikony z frontendového registru.</summary>
    public string Icon { get; private set; } = string.Empty;

    /// <summary>
    /// Klíč barvy karty (<c>mint</c>, <c>rose</c>, <c>amber</c>, <c>violet</c>).
    /// Záměrně se nevaliduje proti whitelistu – neznámý klíč spadne na výchozí barvu
    /// stejně jako neznámý cover. Barvy jsou věc frontendu.
    /// </summary>
    public string Accent { get; private set; } = string.Empty;

    public IReadOnlyCollection<TemplateItem> Items => _items;

    public static Template Create(
        Guid? ownerId,
        string? name,
        string? description,
        string? icon,
        string? accent)
    {
        if (ownerId == Guid.Empty)
        {
            throw new DomainException(
                "template_owner_required",
                "OwnerId must be either null (system template) or a real user.");
        }

        return new Template
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Name = DomainGuard.RequiredText(name, NameMaxLength, "template_name", nameof(name)),
            Description = DomainGuard.OptionalText(
                description,
                DescriptionMaxLength,
                "template_description",
                nameof(description)),
            Icon = DomainGuard.RequiredText(icon, IconMaxLength, "template_icon", nameof(icon)),
            Accent = DomainGuard.RequiredText(accent, AccentMaxLength, "template_accent", nameof(accent)),
        };
    }

    public void Update(string? name, string? description, string? icon, string? accent)
    {
        Name = DomainGuard.RequiredText(name, NameMaxLength, "template_name", nameof(name));
        Description = DomainGuard.OptionalText(
            description,
            DescriptionMaxLength,
            "template_description",
            nameof(description));
        Icon = DomainGuard.RequiredText(icon, IconMaxLength, "template_icon", nameof(icon));
        Accent = DomainGuard.RequiredText(accent, AccentMaxLength, "template_accent", nameof(accent));
    }

    /// <summary>
    /// Přidá položku šablony na konec. Duplicity se neřeší – dvě "Passport" položky
    /// jsou legitimní (merge je v2).
    /// </summary>
    public TemplateItem AddItem(
        string? categoryName,
        string? title,
        string? note,
        int quantity,
        bool isEssential,
        Trips.ItemTraits traits,
        int? weightGrams)
    {
        var item = TemplateItem.Create(
            Id,
            categoryName,
            title,
            note,
            quantity,
            isEssential,
            traits,
            weightGrams,
            _items.Count);

        _items.Add(item);
        return item;
    }

    public void RemoveItem(TemplateItem item)
    {
        ArgumentNullException.ThrowIfNull(item);

        if (!_items.Remove(item))
        {
            throw new DomainException("template_item_missing", "Item does not belong to this template.");
        }

        for (var index = 0; index < _items.Count; index++)
        {
            _items[index].MoveTo(index);
        }
    }
}
