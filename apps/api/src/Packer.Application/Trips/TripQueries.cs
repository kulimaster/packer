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
}
