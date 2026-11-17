using System.Net;
using Packer.Application.Trips;
using Packer.Domain.Trips;

namespace Packer.Api.IntegrationTests;

[Collection(ApiCollectionDefinition.Name)]
public sealed class BagTests(PackerApiFactory factory) : ApiTestBase(factory)
{
    [Fact]
    public async Task Create_bag_returns_empty_bag_with_allowance()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var bag = await CreateBagAsync(client, trip.Id);

        Assert.Equal("Peak Design 45L", bag.Name);
        Assert.Equal(BagKind.CarryOn, bag.Kind);
        Assert.Equal(10m, bag.AllowanceKg);
        Assert.Equal(0, bag.EstimatedWeightGrams);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.Equal(bag.Id, Assert.Single(detail.Bags).Id);
    }

    [Fact]
    public async Task Update_bag_changes_name_kind_and_allowance()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var bag = await CreateBagAsync(client, trip.Id);

        var response = await PutAsync(client, $"/api/bags/{bag.Id}", new
        {
            name = "Checked suitcase",
            kind = "Checked",
            allowanceKg = 23m,
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await ReadAsync<BagDetails>(response);

        Assert.Equal(bag.Id, updated.Id);
        Assert.Equal("Checked suitcase", updated.Name);
        Assert.Equal(BagKind.Checked, updated.Kind);
        Assert.Equal(23m, updated.AllowanceKg);
    }

    [Fact]
    public async Task Assigning_category_moves_its_weight_to_the_bag()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var bag = await CreateBagAsync(client, trip.Id);
        var category = await CreateCategoryAsync(client, trip.Id, "Electronics", "camera");

        await CreateItemAsync(
            client,
            category.Id,
            "Camera",
            quantity: 2,
            weightGrams: 200);

        var response = await PutAsync(
            client,
            $"/api/categories/{category.Id}/bag",
            new { bagId = bag.Id });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var assigned = await ReadAsync<CategoryDetails>(response);

        Assert.Equal(bag.Id, assigned.BagId);
        Assert.Equal(400, assigned.EstimatedWeightGrams);

        var detail = await GetTripAsync(client, trip.Id);
        var bagDetails = Assert.Single(detail.Bags);

        Assert.Equal(400, bagDetails.EstimatedWeightGrams);
        Assert.Equal(bag.Id, Assert.Single(detail.Categories).BagId);
        Assert.Equal(400, detail.EstimatedWeightGrams);
    }

    [Fact]
    public async Task Detaching_category_removes_the_weight_from_the_bag()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var bag = await CreateBagAsync(client, trip.Id);
        var category = await CreateCategoryAsync(client, trip.Id);

        await CreateItemAsync(client, category.Id, "Camera", weightGrams: 200);
        await PutAsync(client, $"/api/categories/{category.Id}/bag", new { bagId = bag.Id });

        var response = await PutAsync(
            client,
            $"/api/categories/{category.Id}/bag",
            new { bagId = (Guid?)null });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var detached = await ReadAsync<CategoryDetails>(response);

        Assert.Null(detached.BagId);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.Equal(0, Assert.Single(detail.Bags).EstimatedWeightGrams);
        Assert.Equal(200, detail.EstimatedWeightGrams);
    }

    [Fact]
    public async Task Deleting_bag_keeps_categories_and_items()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var bag = await CreateBagAsync(client, trip.Id);
        var category = await CreateCategoryAsync(client, trip.Id);
        var item = await CreateItemAsync(client, category.Id, "Camera", weightGrams: 200);

        await PutAsync(client, $"/api/categories/{category.Id}/bag", new { bagId = bag.Id });

        var deleted = await DeleteAsync(client, $"/api/bags/{bag.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.Empty(detail.Bags);
        Assert.Equal(200, detail.EstimatedWeightGrams);

        var categoryDetails = Assert.Single(detail.Categories);

        Assert.Equal(category.Id, categoryDetails.Id);
        Assert.Null(categoryDetails.BagId);
        Assert.Equal(item.Id, Assert.Single(categoryDetails.Items).Id);
    }

    [Fact]
    public async Task Bag_cannot_be_assigned_to_category_from_another_trip()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var firstTrip = await CreateTripAsync(client, "First trip");
        var secondTrip = await CreateTripAsync(client, "Second trip");

        var bag = await CreateBagAsync(client, firstTrip.Id);
        var category = await CreateCategoryAsync(client, secondTrip.Id);

        var response = await PutAsync(
            client,
            $"/api/categories/{category.Id}/bag",
            new { bagId = bag.Id });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("bag_not_found", (await ReadAsync<ErrorBody>(response)).Code);
    }

    [Fact]
    public async Task Foreign_bags_are_invisible()
    {
        using var owner = CreateClient();
        await RegisterAsync(owner);
        var trip = await CreateTripAsync(owner);
        var bag = await CreateBagAsync(owner, trip.Id);
        var category = await CreateCategoryAsync(owner, trip.Id);

        using var stranger = CreateClient();
        await RegisterAsync(stranger);

        var update = await PutAsync(stranger, $"/api/bags/{bag.Id}", new
        {
            name = "Stolen",
            kind = "Checked",
        });

        Assert.Equal(HttpStatusCode.NotFound, update.StatusCode);
        Assert.Equal("bag_not_found", (await ReadAsync<ErrorBody>(update)).Code);

        var assign = await PutAsync(
            stranger,
            $"/api/categories/{category.Id}/bag",
            new { bagId = bag.Id });

        Assert.Equal(HttpStatusCode.NotFound, assign.StatusCode);

        var deleted = await DeleteAsync(stranger, $"/api/bags/{bag.Id}");

        Assert.Equal(HttpStatusCode.NotFound, deleted.StatusCode);
    }

    [Fact]
    public async Task Create_bag_rejects_negative_allowance()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var response = await PostAsync(client, $"/api/trips/{trip.Id}/bags", new
        {
            name = "Impossible",
            kind = "CarryOn",
            allowanceKg = -1m,
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.NotNull(error.Errors);
        Assert.Contains("allowanceKg", error.Errors!.Keys);
    }

    [Fact]
    public async Task Create_bag_for_unknown_trip_returns_not_found()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await PostAsync(client, $"/api/trips/{Guid.NewGuid()}/bags", new
        {
            name = "Homeless bag",
            kind = "Personal",
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("trip_not_found", (await ReadAsync<ErrorBody>(response)).Code);
    }
}
