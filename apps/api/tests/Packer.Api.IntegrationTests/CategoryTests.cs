using System.Net;
using Packer.Application.Trips;
using Packer.Domain.Trips;

namespace Packer.Api.IntegrationTests;

[Collection(ApiCollectionDefinition.Name)]
public sealed class CategoryTests(PackerApiFactory factory) : ApiTestBase(factory)
{
    [Fact]
    public async Task Update_category_changes_details_and_keeps_items()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id, "Documents", "backpack");
        await CreateItemAsync(client, category.Id, "Passport", weightGrams: 30);

        var response = await PutAsync(client, $"/api/categories/{category.Id}", new
        {
            name = "Travel documents",
            icon = "briefcase",
            note = "Front pocket",
            maxWeightKg = 1.5m,
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await ReadAsync<CategoryDetails>(response);

        Assert.Equal("Travel documents", updated.Name);
        Assert.Equal("briefcase", updated.Icon);
        Assert.Equal("Front pocket", updated.Note);
        Assert.Equal(1.5m, updated.MaxWeightKg);
        Assert.Equal(1, updated.TotalCount);

        var detail = await GetTripAsync(client, trip.Id);
        var stored = Assert.Single(detail.Categories);

        Assert.Equal("Travel documents", stored.Name);
        Assert.Equal("Passport", Assert.Single(stored.Items).Title);
    }

    [Fact]
    public async Task Update_category_keeps_its_bag()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var bag = await CreateBagAsync(client, trip.Id);

        var created = await PostAsync(client, $"/api/trips/{trip.Id}/categories", new
        {
            name = "Clothing",
            icon = "shirt",
            bagId = bag.Id,
        });

        var category = await ReadAsync<CategoryDetails>(created);

        var response = await PutAsync(client, $"/api/categories/{category.Id}", new
        {
            name = "Clothes",
            icon = "shirt",
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(bag.Id, (await ReadAsync<CategoryDetails>(response)).BagId);
    }

    [Fact]
    public async Task Update_category_rejects_blank_name_and_keeps_the_old_values()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id, "Documents");

        var response = await PutAsync(client, $"/api/categories/{category.Id}", new
        {
            name = "  ",
            icon = "backpack",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.Contains("name", error.Errors!.Keys);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.Equal("Documents", Assert.Single(detail.Categories).Name);
    }

    [Fact]
    public async Task Update_category_is_rejected_on_archived_trip()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id);

        await ArchiveAsync(client, trip.Id);

        var response = await PutAsync(client, $"/api/categories/{category.Id}", new
        {
            name = "Renamed",
            icon = "backpack",
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("trip_archived", (await ReadAsync<ErrorBody>(response)).Code);
    }

    [Fact]
    public async Task Delete_category_removes_its_items_and_updates_totals()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var documents = await CreateCategoryAsync(client, trip.Id, "Documents");
        var electronics = await CreateCategoryAsync(client, trip.Id, "Electronics", "laptop");

        await CreateItemAsync(client, documents.Id, "Passport", weightGrams: 30);
        await CreateItemAsync(client, electronics.Id, "Charger", quantity: 2, weightGrams: 100);

        var response = await DeleteAsync(client, $"/api/categories/{documents.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var detail = await GetTripAsync(client, trip.Id);
        var remaining = Assert.Single(detail.Categories);

        Assert.Equal("Electronics", remaining.Name);
        Assert.Equal(1, remaining.TotalCount);
        Assert.Equal(200, remaining.EstimatedWeightGrams);
        Assert.Equal(1, detail.TotalCount);
        Assert.Equal(200, detail.EstimatedWeightGrams);
    }

    [Fact]
    public async Task Delete_category_is_rejected_on_archived_trip()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id);

        await ArchiveAsync(client, trip.Id);

        var response = await DeleteAsync(client, $"/api/categories/{category.Id}");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("trip_archived", (await ReadAsync<ErrorBody>(response)).Code);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.Single(detail.Categories);
    }
}
