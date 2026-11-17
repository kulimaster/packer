using System.Net;
using System.Net.Http.Json;
using Packer.Application.Trips;
using Packer.Domain.Trips;

namespace Packer.Api.IntegrationTests;

/// <summary>
/// Společný základ: HTTP klient s vlastním cookie sáčkem, načtení CSRF tokenu
/// a zkratky pro typické scénáře. Testy mluví s API přes HTTP, ne přes DI –
/// jinak by netestovaly routing, serializaci ani middleware.
/// </summary>
public abstract class ApiTestBase(PackerApiFactory factory)
{
    /// <summary>Nový klient = nová session (cookies se mezi klienty nesdílejí).</summary>
    protected HttpClient CreateClient() => factory.CreateClient();

    protected static async Task<TestUser> RegisterAsync(
        HttpClient client,
        string? displayName = null)
    {
        var email = $"user-{Guid.NewGuid():N}@example.com";
        var password = "correct horse battery staple";
        var name = displayName ?? "Integration Tester";

        var response = await PostAsync(client, "/api/auth/register", new
        {
            email,
            displayName = name,
            password,
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var body = await ReadAsync<UserBody>(response);

        return new TestUser(body.Id, email, password, name);
    }

    protected static async Task<TripSummary> CreateTripAsync(
        HttpClient client,
        string title = "Asia Vacation",
        string? destination = "Tokyo & Kyoto, Japan")
    {
        var response = await PostAsync(client, "/api/trips", new { title, destination });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return await ReadAsync<TripSummary>(response);
    }

    protected static async Task<TripDetails> GetTripAsync(HttpClient client, Guid tripId)
    {
        var response = await client.GetAsync($"/api/trips/{tripId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return await ReadAsync<TripDetails>(response);
    }

    protected static async Task<CategoryDetails> CreateCategoryAsync(
        HttpClient client,
        Guid tripId,
        string name = "Documents",
        string icon = "backpack")
    {
        var response = await PostAsync(
            client,
            $"/api/trips/{tripId}/categories",
            new { name, icon });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return await ReadAsync<CategoryDetails>(response);
    }

    protected static async Task<ItemDetails> CreateItemAsync(
        HttpClient client,
        Guid categoryId,
        string title = "Passport",
        int quantity = 1,
        int? weightGrams = null,
        bool isEssential = false,
        ItemTraits flags = ItemTraits.None)
    {
        var response = await PostAsync(client, $"/api/categories/{categoryId}/items", new
        {
            title,
            quantity,
            isEssential,
            flags = flags.ToString(),
            weightGrams,
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return await ReadAsync<ItemDetails>(response);
    }

    protected static async Task<BagDetails> CreateBagAsync(
        HttpClient client,
        Guid tripId,
        string name = "Peak Design 45L",
        string kind = "CarryOn",
        decimal? allowanceKg = 10m)
    {
        var response = await PostAsync(
            client,
            $"/api/trips/{tripId}/bags",
            new { name, kind, allowanceKg });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return await ReadAsync<BagDetails>(response);
    }

    protected static async Task ArchiveAsync(
        HttpClient client,
        Guid tripId,
        bool isArchived = true)
    {
        var response = await SendAsync(
            client,
            HttpMethod.Patch,
            $"/api/trips/{tripId}/archived",
            new { isArchived });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    protected static Task<HttpResponseMessage> PostAsync(
        HttpClient client,
        string path,
        object? body = null) =>
        SendAsync(client, HttpMethod.Post, path, body);

    protected static Task<HttpResponseMessage> PutAsync(
        HttpClient client,
        string path,
        object? body = null) =>
        SendAsync(client, HttpMethod.Put, path, body);

    protected static Task<HttpResponseMessage> PatchAsync(
        HttpClient client,
        string path,
        object? body = null) =>
        SendAsync(client, HttpMethod.Patch, path, body);

    protected static Task<HttpResponseMessage> DeleteAsync(HttpClient client, string path) =>
        SendAsync(client, HttpMethod.Delete, path);

    /// <param name="csrfToken">
    /// Explicitní token pro testy, které ověřují jeho neplatnost (vázaný na uživatele).
    /// Když je <c>null</c>, získá se čerstvý – stejně jako to dělá frontend.
    /// </param>
    protected static async Task<HttpResponseMessage> SendAsync(
        HttpClient client,
        HttpMethod method,
        string path,
        object? body = null,
        string? csrfToken = null)
    {
        using var request = new HttpRequestMessage(method, path);

        if (body is not null)
        {
            request.Content = JsonContent.Create(body, options: ApiJson.Options);
        }

        request.Headers.Add("X-CSRF-TOKEN", csrfToken ?? await CsrfTokenAsync(client));

        return await client.SendAsync(request);
    }

    protected static async Task<string> CsrfTokenAsync(HttpClient client)
    {
        var response = await client.GetAsync("/api/auth/csrf");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await ReadAsync<CsrfBody>(response);

        return body.Token;
    }

    protected static async Task<T> ReadAsync<T>(HttpResponseMessage response)
    {
        var value = await response.Content.ReadFromJsonAsync<T>(ApiJson.Options);

        return value ?? throw new InvalidOperationException(
            $"Response body could not be read as {typeof(T).Name}.");
    }
}

public sealed record TestUser(Guid Id, string Email, string Password, string DisplayName);

internal sealed record UserBody(Guid Id, string Email, string DisplayName);

internal sealed record CsrfBody(string Token);

/// <summary>Tvar chybové odpovědi API (docs/api-contract.md).</summary>
internal sealed record ErrorBody(
    string Code,
    string Message,
    Dictionary<string, string[]>? Errors = null);
