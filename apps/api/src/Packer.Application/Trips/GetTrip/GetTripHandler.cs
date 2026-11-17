using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.GetTrip;

public sealed class GetTripHandler(IAppDbContext db, ICurrentUser currentUser)
{
    public async Task<TripDetails> HandleAsync(Guid tripId, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == tripId && trip.OwnerId == userId),
            cancellationToken);

        var trip = trips.SingleOrDefault() ?? throw NotFoundException.For("trip");

        var categories = await db.ToListAsync(
            db.Categories
                .Where(category => category.TripId == tripId)
                .OrderBy(category => category.Position),
            cancellationToken);

        var categoryIds = categories.Select(category => category.Id).ToList();

        // Empty list by se v SQL přeložil na `IN ()`, což ne všechny providery zvládnou.
        List<Item> items = categoryIds.Count == 0
            ? []
            : await db.ToListAsync(
                db.Items
                    .Where(item => categoryIds.Contains(item.CategoryId))
                    .OrderBy(item => item.Position),
                cancellationToken);

        var bags = await db.ToListAsync(
            db.Bags
                .Where(bag => bag.TripId == tripId)
                .OrderBy(bag => bag.Position),
            cancellationToken);

        var itemsByCategory = items
            .GroupBy(item => item.CategoryId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<Item>)group.OrderBy(item => item.Position).ToList());

        var categoryDetails = categories
            .Select(category => CategoryDetails.From(
                category,
                itemsByCategory.GetValueOrDefault(category.Id) ?? []))
            .ToList();

        var bagDetails = bags
            .Select(bag => BagDetails.From(
                bag,
                categoryDetails
                    .Where(category => category.BagId == bag.Id)
                    .Sum(category => category.EstimatedWeightGrams)))
            .ToList();

        var packedCount = categoryDetails.Sum(category => category.PackedCount);
        var totalCount = categoryDetails.Sum(category => category.TotalCount);

        return new TripDetails(
            trip.Id,
            trip.Title,
            trip.Destination,
            trip.CoverImage,
            trip.StartDate,
            trip.EndDate,
            trip.IsArchived,
            TripStatusRules.Determine(trip.IsArchived, packedCount, totalCount),
            packedCount,
            totalCount,
            categoryDetails.Sum(category => category.EstimatedWeightGrams),
            bagDetails,
            categoryDetails);
    }
}
