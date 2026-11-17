using Microsoft.EntityFrameworkCore;
using Packer.Domain.Templates;
using Packer.Domain.Trips;

namespace Packer.Infrastructure.Persistence;

/// <summary>
/// Systémové šablony (<c>OwnerId = null</c>) dostupné všem uživatelům. Seed je idempotentní –
/// podle jména pozná, co už v databázi je, a chybějící kity doplní. Existující šablonu
/// nikdy nepřepisuje, takže ruční úpravy v DB seed při restartu nesmaže.
/// </summary>
public static class SystemTemplateSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        var existingNames = await db.Templates
            .Where(template => template.OwnerId == null)
            .Select(template => template.Name)
            .ToListAsync(cancellationToken);

        var known = existingNames.ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var definition in Definitions)
        {
            if (known.Contains(definition.Name))
            {
                continue;
            }

            var template = Template.Create(
                ownerId: null,
                definition.Name,
                definition.Description,
                definition.Icon,
                definition.Accent);

            foreach (var item in definition.Items)
            {
                template.AddItem(
                    item.CategoryName,
                    item.Title,
                    note: null,
                    item.Quantity,
                    item.IsEssential,
                    item.Flags,
                    item.WeightGrams);
            }

            db.Add(template);
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private sealed record TemplateDefinition(
        string Name,
        string Description,
        string Icon,
        string Accent,
        IReadOnlyList<TemplateItemDefinition> Items);

    private sealed record TemplateItemDefinition(
        string CategoryName,
        string Title,
        int Quantity = 1,
        bool IsEssential = false,
        ItemTraits Flags = ItemTraits.None,
        int? WeightGrams = null);

    private static readonly TemplateDefinition[] Definitions =
    [
        new(
            "Airplane Carry-on",
            "Everything for a week in a single carry-on.",
            "plane",
            "mint",
            [
                new("Documents", "Passport", IsEssential: true, WeightGrams: 30),
                new("Documents", "Boarding pass", IsEssential: true, WeightGrams: 0),
                new("Documents", "Travel insurance", IsEssential: true, WeightGrams: 0),
                new("Electronics", "Phone", IsEssential: true, Flags: ItemTraits.Battery, WeightGrams: 190),
                new(
                    "Electronics",
                    "Power bank",
                    Flags: ItemTraits.Battery | ItemTraits.CarryOnOnly,
                    WeightGrams: 240),
                new("Electronics", "Charger", WeightGrams: 120),
                new("Electronics", "Universal adapter", WeightGrams: 150),
                new("Clothing", "T-shirts", Quantity: 4, WeightGrams: 150),
                new("Clothing", "Underwear", Quantity: 5, WeightGrams: 50),
                new("Clothing", "Socks", Quantity: 4, WeightGrams: 60),
                new("Clothing", "Light jacket", WeightGrams: 400),
                new("Toiletries", "Toothbrush", WeightGrams: 20),
                new("Toiletries", "Toothpaste", Flags: ItemTraits.TsaLiquid, WeightGrams: 80),
                new("Toiletries", "Deodorant", Flags: ItemTraits.TsaLiquid, WeightGrams: 90),
            ]),
        new(
            "Tropical Weather",
            "Light layers and sun protection for hot, humid destinations.",
            "umbrella",
            "amber",
            [
                new("Clothing", "Swim shorts", WeightGrams: 180),
                new("Clothing", "T-shirts", Quantity: 4, WeightGrams: 140),
                new("Clothing", "Sun hat", WeightGrams: 90),
                new("Clothing", "Sunglasses", IsEssential: true, Flags: ItemTraits.Fragile, WeightGrams: 30),
                new("Beach", "Sunscreen", IsEssential: true, Flags: ItemTraits.TsaLiquid, WeightGrams: 200),
                new("Beach", "After-sun", Flags: ItemTraits.TsaLiquid, WeightGrams: 200),
                new("Beach", "Beach towel", WeightGrams: 400),
                new("Beach", "Flip-flops", WeightGrams: 350),
                new("Health", "Insect repellent", Flags: ItemTraits.TsaLiquid, WeightGrams: 150),
                new("Health", "Rehydration salts", Quantity: 2, WeightGrams: 15),
            ]),
        new(
            "First Aid & Meds",
            "A small kit that covers cuts, headaches and prescriptions.",
            "health",
            "rose",
            [
                new("Health", "Band-aids", WeightGrams: 50),
                new("Health", "Painkillers", IsEssential: true, WeightGrams: 40),
                new("Health", "Antiseptic wipes", WeightGrams: 60),
                new("Health", "Prescription meds", IsEssential: true, WeightGrams: 100),
                new("Health", "Thermometer", Flags: ItemTraits.Fragile, WeightGrams: 60),
                new("Health", "Motion sickness tablets", WeightGrams: 30),
            ]),
        new(
            "Photography Gear",
            "Camera, lenses and the small accessories you always forget.",
            "camera",
            "violet",
            [
                new("Photography", "Camera body", IsEssential: true, Flags: ItemTraits.Fragile, WeightGrams: 650),
                new("Photography", "Lens 24–70 mm", IsEssential: true, Flags: ItemTraits.Fragile, WeightGrams: 800),
                new("Photography", "Spare battery", Quantity: 2, Flags: ItemTraits.Battery, WeightGrams: 80),
                new("Photography", "Memory cards", Quantity: 2, Flags: ItemTraits.Fragile, WeightGrams: 10),
                new("Photography", "Tripod", Flags: ItemTraits.CarryOnOnly, WeightGrams: 1200),
                new("Photography", "Lens cloth", WeightGrams: 20),
                new("Electronics", "Card reader", WeightGrams: 40),
                new(
                    "Electronics",
                    "Power bank",
                    Flags: ItemTraits.Battery | ItemTraits.CarryOnOnly,
                    WeightGrams: 240),
            ]),
        new(
            "Weekend City Break",
            "Two days of clothes and the essentials for a city break.",
            "briefcase",
            "mint",
            [
                new("Clothing", "Jeans", WeightGrams: 600),
                new("Clothing", "T-shirts", Quantity: 2, WeightGrams: 160),
                new("Clothing", "Underwear", Quantity: 2, WeightGrams: 50),
                new("Clothing", "Socks", Quantity: 2, WeightGrams: 60),
                new("Clothing", "Sneakers", WeightGrams: 800),
                new("Documents", "ID card", IsEssential: true, WeightGrams: 10),
                new("Documents", "Hotel booking", WeightGrams: 0),
                new("Electronics", "Phone", IsEssential: true, Flags: ItemTraits.Battery, WeightGrams: 190),
                new("Electronics", "Charger", WeightGrams: 120),
            ]),
        new(
            "Winter Trip",
            "Layers for freezing mornings and long walks in the snow.",
            "backpack",
            "violet",
            [
                new("Clothing", "Thermal base layer", Quantity: 2, WeightGrams: 250),
                new("Clothing", "Fleece", WeightGrams: 500),
                new("Clothing", "Down jacket", IsEssential: true, WeightGrams: 800),
                new("Clothing", "Gloves", IsEssential: true, WeightGrams: 120),
                new("Clothing", "Beanie", IsEssential: true, WeightGrams: 80),
                new("Clothing", "Wool socks", Quantity: 2, WeightGrams: 100),
                new("Clothing", "Waterproof boots", WeightGrams: 1100),
                new("Health", "Lip balm", WeightGrams: 15),
                new("Health", "Hand cream", Flags: ItemTraits.TsaLiquid, WeightGrams: 75),
                new("Accessories", "Sunglasses", Flags: ItemTraits.Fragile, WeightGrams: 30),
                new("Accessories", "Thermos", WeightGrams: 400),
            ]),
    ];
}
