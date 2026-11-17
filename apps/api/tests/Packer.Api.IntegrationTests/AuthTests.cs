using System.Net;
using System.Net.Http.Json;

namespace Packer.Api.IntegrationTests;

[Collection(ApiCollectionDefinition.Name)]
public sealed class AuthTests(PackerApiFactory factory) : ApiTestBase(factory)
{
    [Fact]
    public async Task Health_is_public()
    {
        using var client = CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Protected_endpoints_require_authentication()
    {
        using var client = CreateClient();

        var me = await client.GetAsync("/api/auth/me");
        var trips = await client.GetAsync("/api/trips");
        var templates = await client.GetAsync("/api/templates");

        Assert.Equal(HttpStatusCode.Unauthorized, me.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, trips.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, templates.StatusCode);
    }

    [Fact]
    public async Task Register_sets_cookie_and_returns_current_user()
    {
        using var client = CreateClient();
        var email = $"user-{Guid.NewGuid():N}@example.com";

        var response = await PostAsync(client, "/api/auth/register", new
        {
            email,
            displayName = "Martin",
            password = "correct horse battery staple",
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("/api/auth/me", response.Headers.Location?.OriginalString);

        var created = await ReadAsync<UserBody>(response);

        Assert.Equal(email, created.Email);
        Assert.Equal("Martin", created.DisplayName);

        var me = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, me.StatusCode);

        var current = await ReadAsync<UserBody>(me);

        Assert.Equal(created.Id, current.Id);
        Assert.Equal(email, current.Email);
    }

    [Fact]
    public async Task Register_requires_csrf_token()
    {
        using var client = CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new
            {
                email = $"user-{Guid.NewGuid():N}@example.com",
                displayName = "Martin",
                password = "correct horse battery staple",
            },
            ApiJson.Options);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("csrf_invalid", error.Code);
    }

    [Fact]
    public async Task Register_rejects_short_password()
    {
        using var client = CreateClient();

        var response = await PostAsync(client, "/api/auth/register", new
        {
            email = $"user-{Guid.NewGuid():N}@example.com",
            displayName = "Martin",
            password = "short",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.NotNull(error.Errors);
        Assert.Contains("password", error.Errors!.Keys);
    }

    [Fact]
    public async Task Register_rejects_duplicate_email()
    {
        using var client = CreateClient();
        var user = await RegisterAsync(client);

        var response = await PostAsync(client, "/api/auth/register", new
        {
            email = user.Email,
            displayName = "Second account",
            password = user.Password,
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("validation_failed", error.Code);
        Assert.NotNull(error.Errors);
        Assert.Contains("email", error.Errors!.Keys);
    }

    [Fact]
    public async Task Login_authenticates_existing_user()
    {
        using var registered = CreateClient();
        var user = await RegisterAsync(registered);

        using var client = CreateClient();

        var response = await PostAsync(client, "/api/auth/login", new
        {
            email = user.Email,
            password = user.Password,
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await ReadAsync<UserBody>(response);

        Assert.Equal(user.Id, body.Id);

        var me = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Equal(user.Id, (await ReadAsync<UserBody>(me)).Id);
    }

    [Fact]
    public async Task Login_with_wrong_password_returns_invalid_credentials()
    {
        using var registered = CreateClient();
        var user = await RegisterAsync(registered);

        using var client = CreateClient();

        var response = await PostAsync(client, "/api/auth/login", new
        {
            email = user.Email,
            password = "this is not the password",
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var error = await ReadAsync<ErrorBody>(response);

        Assert.Equal("invalid_credentials", error.Code);
    }

    [Fact]
    public async Task Logout_clears_the_session()
    {
        using var client = CreateClient();
        await RegisterAsync(client);

        var logout = await PostAsync(client, "/api/auth/logout");

        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    /// <summary>
    /// Antiforgery token je vázaný na uživatele. Po odhlášení se stejným tokenem
    /// nesmí projít ani login – jinak by se dal token recyklovat napříč session.
    /// </summary>
    [Fact]
    public async Task Csrf_token_cannot_be_reused_after_logout()
    {
        using var client = CreateClient();
        var user = await RegisterAsync(client);
        var token = await CsrfTokenAsync(client);

        var logout = await SendAsync(
            client,
            HttpMethod.Post,
            "/api/auth/logout",
            csrfToken: token);

        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        var login = await SendAsync(
            client,
            HttpMethod.Post,
            "/api/auth/login",
            new { email = user.Email, password = user.Password },
            token);

        Assert.Equal(HttpStatusCode.BadRequest, login.StatusCode);

        var error = await ReadAsync<ErrorBody>(login);

        Assert.Equal("csrf_invalid", error.Code);
    }
}
