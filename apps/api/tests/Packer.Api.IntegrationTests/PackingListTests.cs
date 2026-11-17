using System.Net;
using Packer.Application.Trips;
using Packer.Domain.Trips;

namespace Packer.Api.IntegrationTests;

[Collection(ApiCollectionDefinition.Name)]
public sealed class PackingListTests(PackerApiFactory factory) : ApiTestBase(factory)
{
    [Fact]
    public async Task Category_and_item_appear_in_detail_with_sums()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var category = await CreateCategoryAsync(client, trip.Id, "Documents");
        var item = await CreateItemAsync(
            client,
            category.Id,
            "Passport",
            quantity: 2,
            weightGrams: 30,
            isEssential: true,
            flags: ItemTraits.CarryOnOnly);

        Assert.Equal(2, item.Quantity);
        Assert.Equal(60, item.EstimatedWeightGrams);
        Assert.Equal(ItemTraits.CarryOnOnly, item.Flags);

        var detail = await GetTripAsync(client, trip.Id);
        var categoryDetails = Assert.Single(detail.Categories);

        Assert.Equal(category.Id, categoryDetails.Id);
        Assert.Equal("Documents", categoryDetails.Name);
        Assert.Equal(0, categoryDetails.PackedCount);
        Assert.Equal(1, categoryDetails.TotalCount);
        Assert.Equal(60, categoryDetails.EstimatedWeightGrams);
        Assert.Equal(60, detail.EstimatedWeightGrams);
        Assert.Equal(0, detail.PackedCount);
        Assert.Equal(TripStatus.NotStarted, detail.Status);

        var itemDetails = Assert.Single(categoryDetails.Items);

        Assert.Equal(item.Id, itemDetails.Id);
        Assert.Equal("Passport", itemDetails.Title);
        Assert.True(itemDetails.IsEssential);
        Assert.Equal(ItemTraits.CarryOnOnly, itemDetails.Flags);
        Assert.Null(itemDetails.PackedAt);
    }

    [Fact]
    public async Task Packing_updates_counts_and_derived_status()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id, "Documents");
        var passport = await CreateItemAsync(client, category.Id, "Passport", weightGrams: 30);
        var visa = await CreateItemAsync(client, category.Id, "Visa", weightGrams: 0);

        var packed = await PatchAsync(
            client,
            $"/api/items/{passport.Id}/packed",
            new { isPacked = true });

        Assert.Equal(HttpStatusCode.OK, packed.StatusCode);

        var packedItem = await ReadAsync<ItemDetails>(packed);

        Assert.True(packedItem.IsPacked);
        Assert.NotNull(packedItem.PackedAt);

        var inProgress = await GetTripAsync(client, trip.Id);

        Assert.Equal(1, inProgress.PackedCount);
        Assert.Equal(2, inProgress.TotalCount);
        Assert.Equal(TripStatus.InProgress, inProgress.Status);

        var listResponse = await client.GetAsync("/api/trips");

        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        Assert.Equal(
            TripStatus.InProgress,
            Assert.Single(await ReadAsync<List<TripSummary>>(listResponse)).Status);

        await PatchAsync(client, $"/api/items/{visa.Id}/packed", new { isPacked = true });

        Assert.Equal(TripStatus.Ready, (await GetTripAsync(client, trip.Id)).Status);

        var unpacked = await PatchAsync(
            client,
            $"/api/items/{passport.Id}/packed",
            new { isPacked = false });

        Assert.Equal(HttpStatusCode.OK, unpacked.StatusCode);

        var unpackedItem = await ReadAsync<ItemDetails>(unpacked);

        Assert.False(unpackedItem.IsPacked);
        Assert.Null(unpackedItem.PackedAt);
        Assert.Equal(TripStatus.InProgress, (await GetTripAsync(client, trip.Id)).Status);
    }

    [Fact]
    public async Task Delete_item_keeps_the_category()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id);
        var item = await CreateItemAsync(client, category.Id);

        var deleted = await DeleteAsync(client, $"/api/items/{item.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);

        var detail = await GetTripAsync(client, trip.Id);
        var categoryDetails = Assert.Single(detail.Categories);

        Assert.Equal(category.Id, categoryDetails.Id);
        Assert.Empty(categoryDetails.Items);
        Assert.Equal(0, categoryDetails.TotalCount);
        Assert.Equal(0, detail.EstimatedWeightGrams);
    }

    [Fact]
    public async Task Item_validation_rejects_zero_quantity()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id);

        var response = await PostAsync(client, $"/api/categories/{category.Id}/items", new
        {
            title = "Broken",
            quantity = 0,
            flags = "None",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.NotNull(error.Errors);
        Assert.Contains("quantity", error.Errors!.Keys);
    }

    [Fact]
    public async Task Category_validation_requires_name_and_icon()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var response = await PostAsync(client, $"/api/trips/{trip.Id}/categories", new
        {
            name = "",
            icon = "",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.NotNull(error.Errors);
        Assert.Contains("name", error.Errors!.Keys);
        Assert.Contains("icon", error.Errors!.Keys);
    }

    [Fact]
    public async Task Foreign_trips_categories_and_items_are_invisible()
    {
        using var owner = CreateClient();
        await RegisterAsync(owner);
        var trip = await CreateTripAsync(owner);
        var category = await CreateCategoryAsync(owner, trip.Id);
        var item = await CreateItemAsync(owner, category.Id);

        using var stranger = CreateClient();
        await RegisterAsync(stranger);

        var newCategory = await PostAsync(stranger, $"/api/trips/{trip.Id}/categories", new
        {
            name = "Health",
            icon = "health",
        });

        Assert.Equal(HttpStatusCode.NotFound, newCategory.StatusCode);
        Assert.Equal("trip_not_found", (await ReadAsync<ErrorBody>(newCategory)).Code);

        var newItem = await PostAsync(stranger, $"/api/categories/{category.Id}/items", new
        {
            title = "Sneaky",
            quantity = 1,
            flags = "None",
        });

        Assert.Equal(HttpStatusCode.NotFound, newItem.StatusCode);
        Assert.Equal("category_not_found", (await ReadAsync<ErrorBody>(newItem)).Code);

        var packed = await PatchAsync(
            stranger,
            $"/api/items/{item.Id}/packed",
            new { isPacked = true });

        Assert.Equal(HttpStatusCode.NotFound, packed.StatusCode);
        Assert.Equal("item_not_found", (await ReadAsync<ErrorBody>(packed)).Code);

        var deleted = await DeleteAsync(stranger, $"/api/items/{item.Id}");

        Assert.Equal(HttpStatusCode.NotFound, deleted.StatusCode);
    }
}
