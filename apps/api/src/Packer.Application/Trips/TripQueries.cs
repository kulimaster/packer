using Packer.Application.Common;
using Packer.Domain.Trips;

namespace Packer.Application.Trips;

/// <summary>
/// Sdílené dotazy na vlastnictví. Cizí entita se chová stejně jako neexistující –
/// klient se nesmí dozvědět, že id patří někomu jinému (docs/api-contract.md).
/// </summary>
internal static class TripQueries
{
    public static IQueryable<Item> ItemsOwnedBy(this IAppDbContext db, Guid userId) =>
        from item in db.Items
        join category in db.Categories on item.CategoryId equals category.Id
        join trip in db.Trips on category.TripId equals trip.Id
        where trip.OwnerId == userId
        select item;

    public static IQueryable<Category> CategoriesOwnedBy(this IAppDbContext db, Guid userId) =>
        from category in db.Categories
        join trip in db.Trips on category.TripId equals trip.Id
        where trip.OwnerId == userId
        select category;

    public static IQueryable<Bag> BagsOwnedBy(this IAppDbContext db, Guid userId) =>
        from bag in db.Bags
        join trip in db.Trips on bag.TripId equals trip.Id
        where trip.OwnerId == userId
        select bag;

    /// <summary>
    /// Hmotnost bagu = součet odhadů položek v přiřazených kategoriích.
    /// Není to uložený sloupec, počítá se při každém čtení (docs/domain-model.md).
    /// </summary>
    public static async Task<int> BagWeightGramsAsync(
        this IAppDbContext db,
        Guid bagId,
        CancellationToken cancellationToken)
    {
        var categoryIds = await db.ToListAsync(
            db.Categories.Where(category => category.BagId == bagId).Select(category => category.Id),
            cancellationToken);

        if (categoryIds.Count == 0)
        {
            return 0;
        }

        var items = await db.ToListAsync(
            db.Items
                .Where(item => categoryIds.Contains(item.CategoryId))
                .Select(item => new { item.WeightGrams, item.Quantity }),
            cancellationToken);

        return items.Sum(item => (item.WeightGrams ?? 0) * item.Quantity);
    }
}
