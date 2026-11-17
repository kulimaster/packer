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
