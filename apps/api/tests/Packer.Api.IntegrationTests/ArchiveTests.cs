using System.Net;
using Packer.Application.Trips;
using Packer.Domain.Trips;

namespace Packer.Api.IntegrationTests;

[Collection(ApiCollectionDefinition.Name)]
public sealed class ArchiveTests(PackerApiFactory factory) : ApiTestBase(factory)
{
    [Fact]
    public async Task Archive_sets_status_and_hides_trip_from_active_list()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        await ArchiveAsync(client, trip.Id);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.True(detail.IsArchived);
        Assert.Equal(TripStatus.Archived, detail.Status);

        var visibleResponse = await client.GetAsync("/api/trips");

        Assert.Equal(HttpStatusCode.OK, visibleResponse.StatusCode);
        Assert.Empty(await ReadAsync<List<TripSummary>>(visibleResponse));

        var allResponse = await client.GetAsync("/api/trips?includeArchived=true");

        Assert.Equal(HttpStatusCode.OK, allResponse.StatusCode);
        Assert.True(Assert.Single(await ReadAsync<List<TripSummary>>(allResponse)).IsArchived);
    }

    [Fact]
    public async Task Archive_is_idempotent()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        await ArchiveAsync(client, trip.Id);
        await ArchiveAsync(client, trip.Id);
        await ArchiveAsync(client, trip.Id, isArchived: false);
        await ArchiveAsync(client, trip.Id, isArchived: false);

        Assert.False((await GetTripAsync(client, trip.Id)).IsArchived);
    }

    [Fact]
    public async Task Unarchive_allows_editing_again()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        await ArchiveAsync(client, trip.Id);
        await ArchiveAsync(client, trip.Id, isArchived: false);

        var category = await CreateCategoryAsync(client, trip.Id, "Health", "health");

        Assert.Equal("Health", category.Name);
        Assert.False((await GetTripAsync(client, trip.Id)).IsArchived);
    }

    [Fact]
    public async Task Archived_trip_rejects_new_categories_items_and_bags()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var (tripId, categoryId, _, _) = await SeedArchivedTripAsync(client);
        var category = await PostAsync(client, $"/api/trips/{tripId}/categories", new
        {
            name = "Health",
            icon = "health",
        });

        await AssertArchivedAsync(category);

        var item = await PostAsync(client, $"/api/categories/{categoryId}/items", new
        {
            title = "Socks",
            quantity = 1,
            flags = "None",
        });

        await AssertArchivedAsync(item);

        var bag = await PostAsync(client, $"/api/trips/{tripId}/bags", new
        {
            name = "Late bag",
            kind = "Checked",
        });

        await AssertArchivedAsync(bag);
    }

    [Fact]
    public async Task Archived_trip_rejects_changes_to_items_and_bags()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var (tripId, categoryId, itemId, bagId) = await SeedArchivedTripAsync(client);

        var packed = await PatchAsync(
            client,
            $"/api/items/{itemId}/packed",
            new { isPacked = true });

        await AssertArchivedAsync(packed);

        var deleted = await DeleteAsync(client, $"/api/items/{itemId}");

        await AssertArchivedAsync(deleted);

        var assigned = await PutAsync(
            client,
            $"/api/categories/{categoryId}/bag",
            new { bagId });

        await AssertArchivedAsync(assigned);

        var updatedBag = await PutAsync(client, $"/api/bags/{bagId}", new
        {
            name = "Renamed",
            kind = "Checked",
        });

        await AssertArchivedAsync(updatedBag);
    }

    /// <summary>Výlet s bagem, kategorií a položkou, který je hned archivovaný.</summary>
    private static async Task<(Guid TripId, Guid CategoryId, Guid ItemId, Guid BagId)>
        SeedArchivedTripAsync(HttpClient client)
    {
        var trip = await CreateTripAsync(client);
        var bag = await CreateBagAsync(client, trip.Id);
        var category = await CreateCategoryAsync(client, trip.Id);
        var item = await CreateItemAsync(client, category.Id, "Passport", weightGrams: 30);

        await ArchiveAsync(client, trip.Id);

        return (trip.Id, category.Id, item.Id, bag.Id);
    }

    private static async Task AssertArchivedAsync(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("trip_archived", error.Code);
    }
}
