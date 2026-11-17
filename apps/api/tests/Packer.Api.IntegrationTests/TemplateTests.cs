using System.Net;
using Packer.Application.Templates.GetTemplate;
using Packer.Application.Templates.GetTemplates;
using Packer.Application.Trips.ImportTemplates;

namespace Packer.Api.IntegrationTests;

[Collection(ApiCollectionDefinition.Name)]
public sealed class TemplateTests(PackerApiFactory factory) : ApiTestBase(factory)
{
    private static readonly string[] AirplaneCategories =
        ["Documents", "Electronics", "Clothing", "Toiletries"];

    private static readonly string[] FirstAidNames = ["First Aid & Meds"];

    [Fact]
    public async Task List_returns_seeded_system_templates()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await client.GetAsync("/api/templates");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var templates = await ReadAsync<List<TemplateSummary>>(response);

        Assert.Equal(6, templates.Count);
        Assert.All(templates, template => Assert.True(template.IsSystem));

        var carryOn = SingleByName(templates, "Airplane Carry-on");

        Assert.Equal(14, carryOn.ItemCount);
        Assert.Equal(2410, carryOn.EstimatedWeightGrams);
        Assert.Equal(
            AirplaneCategories,
            carryOn.Categories);
    }

    [Fact]
    public async Task Detail_returns_template_items()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var template = await FindTemplateAsync(client, "Airplane Carry-on");

        var response = await client.GetAsync($"/api/templates/{template.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var detail = await ReadAsync<TemplateDetails>(response);

        Assert.Equal(template.Id, detail.Id);
        Assert.Equal(14, detail.Items.Count);
        Assert.Equal(2410, detail.EstimatedWeightGrams);

        var passport = detail.Items[0];

        Assert.Equal("Passport", passport.Title);
        Assert.Equal("Documents", passport.CategoryName);
        Assert.True(passport.IsEssential);
        Assert.Equal(30, passport.WeightGrams);
    }

    [Fact]
    public async Task Unknown_template_returns_not_found()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var response = await client.GetAsync($"/api/templates/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("template_not_found", (await ReadAsync<ErrorBody>(response)).Code);
    }

    [Fact]
    public async Task Import_creates_categories_and_items()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var template = await FindTemplateAsync(client, "First Aid & Meds");

        var result = await ImportAsync(client, trip.Id, template.Id);

        Assert.Equal(trip.Id, result.TripId);
        Assert.Equal(FirstAidNames, result.TemplateNames);
        Assert.Equal(1, result.CategoriesCreated);
        Assert.Equal(6, result.ItemsCreated);

        var detail = await GetTripAsync(client, trip.Id);
        var category = Assert.Single(detail.Categories);

        Assert.Equal("Health", category.Name);
        Assert.Equal(template.Icon, category.Icon);
        Assert.Equal(6, category.TotalCount);
        Assert.Equal(0, category.PackedCount);
        Assert.Equal(340, detail.EstimatedWeightGrams);
    }

    [Fact]
    public async Task Import_matches_existing_categories_by_name_ignoring_case()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var documents = await CreateCategoryAsync(client, trip.Id, "documents", "backpack");
        var template = await FindTemplateAsync(client, "Airplane Carry-on");

        var result = await ImportAsync(client, trip.Id, template.Id);

        Assert.Equal(3, result.CategoriesCreated);
        Assert.Equal(14, result.ItemsCreated);

        var detail = await GetTripAsync(client, trip.Id);

        Assert.Equal(4, detail.Categories.Count);

        var existing = detail.Categories.Single(category => category.Id == documents.Id);

        Assert.Equal("documents", existing.Name);
        Assert.Equal("backpack", existing.Icon);
        Assert.Equal(3, existing.TotalCount);
    }

    [Fact]
    public async Task Import_twice_appends_items_without_new_categories()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var template = await FindTemplateAsync(client, "Airplane Carry-on");

        await ImportAsync(client, trip.Id, template.Id);

        var second = await ImportAsync(client, trip.Id, template.Id);

        Assert.Equal(0, second.CategoriesCreated);
        Assert.Equal(14, second.ItemsCreated);
        Assert.Equal(28, (await GetTripAsync(client, trip.Id)).TotalCount);
    }

    [Fact]
    public async Task Import_rejects_empty_selection()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var response = await PostAsync(
            client,
            $"/api/trips/{trip.Id}/templates",
            new { templateIds = Array.Empty<Guid>() });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.NotNull(error.Errors);
        Assert.Contains("templateIds", error.Errors!.Keys);
    }

    [Fact]
    public async Task Import_unknown_template_returns_not_found()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var response = await PostAsync(
            client,
            $"/api/trips/{trip.Id}/templates",
            new { templateIds = new[] { Guid.NewGuid() } });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        // Výlet i šablony se validují před zápisem – nic se nesmí uložit napůl.
        Assert.Equal("template_not_found", (await ReadAsync<ErrorBody>(response)).Code);
        Assert.Empty((await GetTripAsync(client, trip.Id)).Categories);
    }

    [Fact]
    public async Task Import_into_archived_trip_returns_conflict()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var template = await FindTemplateAsync(client, "Winter Trip");

        await ArchiveAsync(client, trip.Id);

        var response = await PostAsync(
            client,
            $"/api/trips/{trip.Id}/templates",
            new { templateIds = new[] { template.Id } });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("trip_archived", (await ReadAsync<ErrorBody>(response)).Code);
    }

    [Fact]
    public async Task Import_into_foreign_trip_returns_not_found()
    {
        using var owner = CreateClient();
        await RegisterAsync(owner);
        var trip = await CreateTripAsync(owner);

        using var stranger = CreateClient();
        await RegisterAsync(stranger);
        var template = await FindTemplateAsync(stranger, "Winter Trip");

        var response = await PostAsync(
            stranger,
            $"/api/trips/{trip.Id}/templates",
            new { templateIds = new[] { template.Id } });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("trip_not_found", (await ReadAsync<ErrorBody>(response)).Code);
    }

    private static async Task<TemplateSummary> FindTemplateAsync(HttpClient client, string name)
    {
        var response = await client.GetAsync("/api/templates");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var templates = await ReadAsync<List<TemplateSummary>>(response);

        return SingleByName(templates, name);
    }

    private static TemplateSummary SingleByName(
        IReadOnlyList<TemplateSummary> templates,
        string name)
    {
        var matches = templates.Where(template => template.Name == name).ToList();

        Assert.Single(matches);

        return matches[0];
    }

    private static async Task<ImportTemplatesResult> ImportAsync(
        HttpClient client,
        Guid tripId,
        params Guid[] templateIds)
    {
        var response = await PostAsync(
            client,
            $"/api/trips/{tripId}/templates",
            new { templateIds });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return await ReadAsync<ImportTemplatesResult>(response);
    }
}
