using System.Net;
using System.Net.Http.Json;
using Packer.Application.Trips;
using Packer.Domain.Trips;

namespace Packer.Api.IntegrationTests;

[Collection(ApiCollectionDefinition.Name)]
public sealed class TripTests(PackerApiFactory factory) : ApiTestBase(factory)
{
    [Fact]
    public async Task Create_returns_created_trip_with_location()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await PostAsync(client, "/api/trips", new
        {
            title = "Asia Vacation",
            destination = "Tokyo & Kyoto, Japan",
            startDate = "2026-05-01",
            endDate = "2026-05-12",
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var trip = await ReadAsync<TripSummary>(response);

        Assert.Equal($"/api/trips/{trip.Id}", response.Headers.Location?.OriginalString);
        Assert.Equal("Asia Vacation", trip.Title);
        Assert.Equal("Tokyo & Kyoto, Japan", trip.Destination);
        Assert.Equal(new DateOnly(2026, 5, 1), trip.StartDate);
        Assert.Equal(new DateOnly(2026, 5, 12), trip.EndDate);
        Assert.False(trip.IsArchived);
        Assert.Equal(TripStatus.NotStarted, trip.Status);
        Assert.Equal(0, trip.PackedCount);
        Assert.Equal(0, trip.TotalCount);
    }

    [Fact]
    public async Task Create_requires_csrf_even_with_cookie()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await client.PostAsJsonAsync(
            "/api/trips",
            new { title = "Without token" },
            ApiJson.Options);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("csrf_invalid", (await ReadAsync<ErrorBody>(response)).Code);
    }

    [Fact]
    public async Task Create_rejects_missing_title()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await PostAsync(client, "/api/trips", new { title = (string?)null });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.NotNull(error.Errors);
        Assert.Contains("title", error.Errors!.Keys);
    }

    [Fact]
    public async Task Create_rejects_end_date_before_start_date()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await PostAsync(client, "/api/trips", new
        {
            title = "Backwards",
            startDate = "2026-05-12",
            endDate = "2026-05-01",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.NotNull(error.Errors);
        Assert.Contains("endDate", error.Errors!.Keys);
    }

    [Fact]
    public async Task Detail_of_new_trip_is_empty()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.Empty(detail.Categories);
        Assert.Empty(detail.Bags);
        Assert.Equal(0, detail.EstimatedWeightGrams);
        Assert.Equal(TripStatus.NotStarted, detail.Status);
    }

    [Fact]
    public async Task List_hides_archived_trips_until_asked()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var active = await CreateTripAsync(client, "Active trip");
        var old = await CreateTripAsync(client, "Old trip");
        await ArchiveAsync(client, old.Id);

        var visibleResponse = await client.GetAsync("/api/trips");

        Assert.Equal(HttpStatusCode.OK, visibleResponse.StatusCode);

        var visible = await ReadAsync<List<TripSummary>>(visibleResponse);

        Assert.Single(visible);
        Assert.Equal(active.Id, visible[0].Id);

        var allResponse = await client.GetAsync("/api/trips?includeArchived=true");

        Assert.Equal(HttpStatusCode.OK, allResponse.StatusCode);

        var all = await ReadAsync<List<TripSummary>>(allResponse);

        Assert.Equal(2, all.Count);
        Assert.Contains(
            all,
            trip => trip.Id == old.Id
                && trip.IsArchived
                && trip.Status == TripStatus.Archived);
    }

    [Fact]
    public async Task List_and_detail_show_only_own_trips()
    {
        using var owner = CreateClient();
        await RegisterAsync(owner);
        var trip = await CreateTripAsync(owner);

        using var stranger = CreateClient();
        await RegisterAsync(stranger);

        var listResponse = await stranger.GetAsync("/api/trips");

        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        Assert.Empty(await ReadAsync<List<TripSummary>>(listResponse));

        var detail = await stranger.GetAsync($"/api/trips/{trip.Id}");

        Assert.Equal(HttpStatusCode.NotFound, detail.StatusCode);
        Assert.Equal("trip_not_found", (await ReadAsync<ErrorBody>(detail)).Code);
    }

    [Fact]
    public async Task Update_trip_changes_details_and_keeps_counts()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id);
        await CreateItemAsync(client, category.Id, "Passport", weightGrams: 30);

        var response = await PutAsync(client, $"/api/trips/{trip.Id}", new
        {
            title = "Japan 2026",
            destination = "Osaka, Japan",
            coverImage = "beach",
            startDate = "2026-05-02",
            endDate = "2026-05-14",
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await ReadAsync<TripSummary>(response);

        Assert.Equal("Japan 2026", updated.Title);
        Assert.Equal("Osaka, Japan", updated.Destination);
        Assert.Equal("beach", updated.CoverImage);
        Assert.Equal(new DateOnly(2026, 5, 2), updated.StartDate);
        Assert.Equal(new DateOnly(2026, 5, 14), updated.EndDate);
        Assert.Equal(1, updated.TotalCount);
        Assert.Equal(TripStatus.NotStarted, updated.Status);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.Equal("Japan 2026", detail.Title);
        Assert.Single(detail.Categories);
    }

    [Fact]
    public async Task Update_trip_rejects_end_date_before_start_date()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var response = await PutAsync(client, $"/api/trips/{trip.Id}", new
        {
            title = "Backwards",
            startDate = "2026-05-12",
            endDate = "2026-05-01",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.Contains("endDate", error.Errors!.Keys);

        Assert.Equal("Asia Vacation", (await GetTripAsync(client, trip.Id)).Title);
    }

    [Fact]
    public async Task Update_trip_is_rejected_on_archived_trip()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        await ArchiveAsync(client, trip.Id);

        var response = await PutAsync(client, $"/api/trips/{trip.Id}", new
        {
            title = "Renamed",
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("trip_archived", (await ReadAsync<ErrorBody>(response)).Code);
    }

    [Fact]
    public async Task Foreign_trip_cannot_be_updated_or_deleted()
    {
        using var owner = CreateClient();
        await RegisterAsync(owner);
        var trip = await CreateTripAsync(owner);

        using var stranger = CreateClient();
        await RegisterAsync(stranger);

        var updated = await PutAsync(stranger, $"/api/trips/{trip.Id}", new
        {
            title = "Sneaky",
        });

        Assert.Equal(HttpStatusCode.NotFound, updated.StatusCode);
        Assert.Equal("trip_not_found", (await ReadAsync<ErrorBody>(updated)).Code);

        var deleted = await DeleteAsync(stranger, $"/api/trips/{trip.Id}");

        Assert.Equal(HttpStatusCode.NotFound, deleted.StatusCode);

        Assert.Equal("Asia Vacation", (await GetTripAsync(owner, trip.Id)).Title);
    }

    [Fact]
    public async Task Delete_trip_removes_it_and_its_packing_list()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var category = await CreateCategoryAsync(client, trip.Id);
        await CreateItemAsync(client, category.Id);

        var response = await DeleteAsync(client, $"/api/trips/{trip.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var detail = await client.GetAsync($"/api/trips/{trip.Id}");

        Assert.Equal(HttpStatusCode.NotFound, detail.StatusCode);

        var listResponse = await client.GetAsync("/api/trips?includeArchived=true");

        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        Assert.Empty(await ReadAsync<List<TripSummary>>(listResponse));
    }

    [Fact]
    public async Task Delete_trip_works_for_archived_trip()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        await ArchiveAsync(client, trip.Id);

        var response = await DeleteAsync(client, $"/api/trips/{trip.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.GetAsync($"/api/trips/{trip.Id}")).StatusCode);
    }

    [Fact]
    public async Task Unknown_trip_returns_not_found()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await client.GetAsync($"/api/trips/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("trip_not_found", (await ReadAsync<ErrorBody>(response)).Code);
    }

    [Fact]
    public async Task Archiving_unknown_trip_returns_not_found()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await PatchAsync(
            client,
            $"/api/trips/{Guid.NewGuid()}/archived",
            new { isArchived = true });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
