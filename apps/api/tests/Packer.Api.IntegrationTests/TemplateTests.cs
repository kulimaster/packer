using System.Net;
using Packer.Application.Templates.GetTemplate;
using Packer.Application.Templates.GetTemplates;
using Packer.Application.Trips.ImportTemplates;
using Packer.Domain.Trips;

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

    [Fact]
    public async Task Create_from_trip_copies_categories_and_items()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var documents = await CreateCategoryAsync(client, trip.Id, "Documents", "lock");
        var clothing = await CreateCategoryAsync(client, trip.Id, "Clothing", "shirt");

        await CreateItemAsync(client, documents.Id, "Passport", quantity: 2, weightGrams: 30, isEssential: true);
        await CreateItemAsync(client, clothing.Id, "Socks", quantity: 5, weightGrams: 20);

        var response = await PostAsync(client, "/api/templates", new
        {
            tripId = trip.Id,
            name = "Japan kit",
            description = "Co vozím do Japonska",
            icon = "backpack",
            accent = "mint",
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var template = await ReadAsync<TemplateSummary>(response);

        Assert.Equal($"/api/templates/{template.Id}", response.Headers.Location?.OriginalString);
        Assert.Equal("Japan kit", template.Name);
        Assert.Equal("Co vozím do Japonska", template.Description);
        Assert.False(template.IsSystem);
        Assert.Equal(2, template.ItemCount);
        Assert.Equal(160, template.EstimatedWeightGrams);
        Assert.Equal(["Documents", "Clothing"], template.Categories);

        var detail = await ReadAsync<TemplateDetails>(
            await client.GetAsync($"/api/templates/{template.Id}"));

        Assert.Equal(2, detail.Items.Count);

        var passport = detail.Items[0];

        Assert.Equal("Passport", passport.Title);
        Assert.Equal("Documents", passport.CategoryName);
        Assert.Equal(2, passport.Quantity);
        Assert.True(passport.IsEssential);

        var socks = detail.Items[1];

        Assert.Equal("Socks", socks.Title);
        Assert.Equal("Clothing", socks.CategoryName);
        Assert.Equal(5, socks.Quantity);
    }

    [Fact]
    public async Task Create_lists_own_template_alongside_system_templates()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);

        var created = await CreateTemplateAsync(client, trip.Id, "Moje šablona");

        var response = await client.GetAsync("/api/templates");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var templates = await ReadAsync<List<TemplateSummary>>(response);

        Assert.Equal(7, templates.Count);

        var mine = SingleByName(templates, "Moje šablona");

        Assert.False(mine.IsSystem);
        Assert.Equal(created.Id, mine.Id);
        Assert.Equal(6, templates.Count(template => template.IsSystem));
    }

    [Fact]
    public async Task Create_from_foreign_trip_returns_not_found()
    {
        using var owner = CreateClient();
        await RegisterAsync(owner);
        var trip = await CreateTripAsync(owner);

        using var stranger = CreateClient();
        await RegisterAsync(stranger);

        var response = await PostAsync(stranger, "/api/templates", new
        {
            tripId = trip.Id,
            name = "Sneaky kit",
            icon = "backpack",
            accent = "mint",
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("trip_not_found", (await ReadAsync<ErrorBody>(response)).Code);
    }

    [Fact]
    public async Task Update_changes_own_template_metadata()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var template = await CreateTemplateAsync(client, trip.Id, "Pracovní cesta");

        var response = await PutAsync(client, $"/api/templates/{template.Id}", new
        {
            name = "Pracovní cesta 2026",
            description = "Notebook a nabíječky",
            icon = "briefcase",
            accent = "violet",
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await ReadAsync<TemplateSummary>(response);

        Assert.Equal("Pracovní cesta 2026", updated.Name);
        Assert.Equal("Notebook a nabíječky", updated.Description);
        Assert.Equal("briefcase", updated.Icon);
        Assert.Equal("violet", updated.Accent);
        Assert.False(updated.IsSystem);
    }

    [Fact]
    public async Task System_template_cannot_be_updated_or_deleted()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var template = await FindTemplateAsync(client, "Winter Trip");

        var updated = await PutAsync(client, $"/api/templates/{template.Id}", new
        {
            name = "Hacked",
            icon = "backpack",
            accent = "mint",
        });

        Assert.Equal(HttpStatusCode.NotFound, updated.StatusCode);
        Assert.Equal("template_not_found", (await ReadAsync<ErrorBody>(updated)).Code);

        var deleted = await DeleteAsync(client, $"/api/templates/{template.Id}");

        Assert.Equal(HttpStatusCode.NotFound, deleted.StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            (await client.GetAsync($"/api/templates/{template.Id}")).StatusCode);
    }

    [Fact]
    public async Task Foreign_template_cannot_be_updated_or_deleted()
    {
        using var owner = CreateClient();
        await RegisterAsync(owner);
        var trip = await CreateTripAsync(owner);
        var template = await CreateTemplateAsync(owner, trip.Id, "Moje šablona");

        using var stranger = CreateClient();
        await RegisterAsync(stranger);

        var updated = await PutAsync(stranger, $"/api/templates/{template.Id}", new
        {
            name = "Ukradeno",
            icon = "backpack",
            accent = "mint",
        });

        Assert.Equal(HttpStatusCode.NotFound, updated.StatusCode);

        var deleted = await DeleteAsync(stranger, $"/api/templates/{template.Id}");

        Assert.Equal(HttpStatusCode.NotFound, deleted.StatusCode);

        // Šablona je pořád vidět jen majiteli a pořád se jmenuje stejně.
        Assert.Equal("Moje šablona", SingleByName(
            await ReadAsync<List<TemplateSummary>>(await owner.GetAsync("/api/templates")),
            "Moje šablona").Name);
    }

    [Fact]
    public async Task Delete_removes_own_template_and_keeps_system_ones()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var template = await CreateTemplateAsync(client, trip.Id, "Do koše");

        var response = await DeleteAsync(client, $"/api/templates/{template.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.GetAsync($"/api/templates/{template.Id}")).StatusCode);

        var templates = await ReadAsync<List<TemplateSummary>>(await client.GetAsync("/api/templates"));

        Assert.Equal(6, templates.Count);
        Assert.All(templates, entry => Assert.True(entry.IsSystem));
    }

    [Fact]
    public async Task AddItem_appends_to_own_template()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var template = await CreateTemplateAsync(client, trip.Id, "Prázdná šablona");

        var response = await PostAsync(client, $"/api/templates/{template.Id}/items", new
        {
            categoryName = "Electronics",
            title = "Power bank",
            note = "Nabít před odletem",
            quantity = 1,
            isEssential = false,
            flags = "Battery, CarryOnOnly",
            weightGrams = 240,
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var item = await ReadAsync<TemplateItemDetails>(response);

        Assert.Equal($"/api/templates/{template.Id}/items/{item.Id}", response.Headers.Location?.OriginalString);
        Assert.Equal("Electronics", item.CategoryName);
        Assert.Equal("Power bank", item.Title);
        Assert.Equal("Nabít před odletem", item.Note);
        Assert.Equal(ItemTraits.Battery | ItemTraits.CarryOnOnly, item.Flags);
        Assert.Equal(240, item.EstimatedWeightGrams);

        var detail = await ReadAsync<TemplateDetails>(
            await client.GetAsync($"/api/templates/{template.Id}"));

        Assert.Single(detail.Items);
        Assert.Equal(240, detail.EstimatedWeightGrams);
        Assert.Equal(["Electronics"], detail.Items.Select(entry => entry.CategoryName));
    }

    [Fact]
    public async Task UpdateItem_changes_own_item()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var documents = await CreateCategoryAsync(client, trip.Id, "Documents", "lock");
        await CreateItemAsync(client, documents.Id, "Passport", quantity: 1, weightGrams: 30);
        var template = await CreateTemplateAsync(client, trip.Id, "Doklady");

        var detail = await ReadAsync<TemplateDetails>(
            await client.GetAsync($"/api/templates/{template.Id}"));
        var itemId = Assert.Single(detail.Items).Id;

        var response = await PutAsync(client, $"/api/templates/{template.Id}/items/{itemId}", new
        {
            categoryName = "Documents",
            title = "Passport + visa",
            note = "Dvě kopie",
            quantity = 2,
            isEssential = true,
            flags = "None",
            weightGrams = 40,
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await ReadAsync<TemplateItemDetails>(response);

        Assert.Equal(itemId, updated.Id);
        Assert.Equal("Passport + visa", updated.Title);
        Assert.Equal(2, updated.Quantity);
        Assert.True(updated.IsEssential);
        Assert.Equal(80, updated.EstimatedWeightGrams);
    }

    [Fact]
    public async Task DeleteItem_removes_item_from_own_template()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var documents = await CreateCategoryAsync(client, trip.Id, "Documents", "lock");
        await CreateItemAsync(client, documents.Id, "Passport", quantity: 1, weightGrams: 30);
        await CreateItemAsync(client, documents.Id, "Visa", quantity: 1, weightGrams: 10);
        var template = await CreateTemplateAsync(client, trip.Id, "Doklady");

        var detail = await ReadAsync<TemplateDetails>(
            await client.GetAsync($"/api/templates/{template.Id}"));
        var visa = detail.Items.Single(item => item.Title == "Visa");

        var response = await DeleteAsync(client, $"/api/templates/{template.Id}/items/{visa.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var after = await ReadAsync<TemplateDetails>(
            await client.GetAsync($"/api/templates/{template.Id}"));

        var remaining = Assert.Single(after.Items);

        Assert.Equal("Passport", remaining.Title);
        Assert.Equal(30, after.EstimatedWeightGrams);
    }

    [Fact]
    public async Task Items_of_system_template_cannot_be_changed()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var template = await FindTemplateAsync(client, "Winter Trip");

        var detail = await ReadAsync<TemplateDetails>(
            await client.GetAsync($"/api/templates/{template.Id}"));
        var itemId = detail.Items[0].Id;

        var added = await PostAsync(client, $"/api/templates/{template.Id}/items", new
        {
            categoryName = "Clothing",
            title = "Hacked",
            quantity = 1,
        });

        Assert.Equal(HttpStatusCode.NotFound, added.StatusCode);
        Assert.Equal("template_not_found", (await ReadAsync<ErrorBody>(added)).Code);

        var updated = await PutAsync(client, $"/api/templates/{template.Id}/items/{itemId}", new
        {
            categoryName = "Clothing",
            title = "Hacked",
            quantity = 1,
        });

        Assert.Equal(HttpStatusCode.NotFound, updated.StatusCode);
        Assert.Equal("template_not_found", (await ReadAsync<ErrorBody>(updated)).Code);

        var deleted = await DeleteAsync(client, $"/api/templates/{template.Id}/items/{itemId}");

        Assert.Equal(HttpStatusCode.NotFound, deleted.StatusCode);
    }

    [Fact]
    public async Task Item_from_another_template_returns_not_found()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var documents = await CreateCategoryAsync(client, trip.Id, "Documents", "lock");
        await CreateItemAsync(client, documents.Id, "Passport", quantity: 1, weightGrams: 30);
        var first = await CreateTemplateAsync(client, trip.Id, "První");
        var second = await CreateTemplateAsync(client, trip.Id, "Druhá");

        var detail = await ReadAsync<TemplateDetails>(
            await client.GetAsync($"/api/templates/{second.Id}"));
        var foreignItemId = Assert.Single(detail.Items).Id;

        var updated = await PutAsync(client, $"/api/templates/{first.Id}/items/{foreignItemId}", new
        {
            categoryName = "Documents",
            title = "Podstrčeno",
            quantity = 1,
        });

        Assert.Equal(HttpStatusCode.NotFound, updated.StatusCode);
        Assert.Equal("template_item_not_found", (await ReadAsync<ErrorBody>(updated)).Code);

        var deleted = await DeleteAsync(client, $"/api/templates/{first.Id}/items/{foreignItemId}");

        Assert.Equal(HttpStatusCode.NotFound, deleted.StatusCode);

        // Položka zůstala tam, kam patří.
        var secondAfter = await ReadAsync<TemplateDetails>(
            await client.GetAsync($"/api/templates/{second.Id}"));

        Assert.Equal("Passport", Assert.Single(secondAfter.Items).Title);
    }

    [Fact]
    public async Task AddItem_validates_payload()
    {
        using var client = CreateClient();
        await RegisterAsync(client);
        var trip = await CreateTripAsync(client);
        var template = await CreateTemplateAsync(client, trip.Id, "Validace");

        var response = await PostAsync(client, $"/api/templates/{template.Id}/items", new
        {
            categoryName = "",
            title = "",
            quantity = 0,
            weightGrams = -5,
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var errors = await ReadAsync<ErrorBody>(response);

        Assert.NotNull(errors.Errors);
        Assert.Contains("categoryName", errors.Errors.Keys);
        Assert.Contains("title", errors.Errors.Keys);
        Assert.Contains("quantity", errors.Errors.Keys);
        Assert.Contains("weightGrams", errors.Errors.Keys);
    }

    private static async Task<TemplateSummary> CreateTemplateAsync(
        HttpClient client,
        Guid tripId,
        string name)
    {
        var response = await PostAsync(client, "/api/templates", new
        {
            tripId,
            name,
            icon = "backpack",
            accent = "mint",
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return await ReadAsync<TemplateSummary>(response);
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
