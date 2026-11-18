using System.Text.Json.Serialization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Packer.Api.Auth;
using Packer.Api.Common;
using Packer.Api.Templates;
using Packer.Api.Trips;
using Packer.Application.Common;
using Packer.Infrastructure;
using Packer.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Enumy ven jako string ("CarryOn"), ne číslo – viz docs/api-contract.md.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

builder.Services.AddHttpContextAccessor();

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        // Délka místo skládanky znaků: dlouhá passphrase je bezpečnější a lépe se pamatuje.
        options.Password.RequiredLength = 10;
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services
    .AddAuthentication(IdentityConstants.ApplicationScheme)
    .AddIdentityCookies();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "packer.auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromDays(30);
    options.SlidingExpiration = true;

    // API neumí přesměrovat na login stránku – klient čeká 401/403.
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization();

builder.Services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");

// V produkci stojí před API Caddy: dovnitř jde HTTP, ven HTTPS. Bez tohohle by
// si API myslelo, že požadavek není HTTPS, a autentizační cookie by neměla Secure.
// Jediný, kdo se na API může připojit, je proxy v interní síti – proto se jí věří.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    options.KnownProxies.Clear();
    options.KnownIPNetworks.Clear();
});

// Klíče pro šifrování cookie musí přežít restart kontejneru, jinak by se po každém
// nasazení všichni odhlásili. V devu se cesta nekonfiguruje a použije se výchozí.
if (builder.Configuration["DataProtection:KeysPath"] is { Length: > 0 } keysPath)
{
    builder.Services
        .AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(keysPath));
}

var app = builder.Build();

app.UseForwardedHeaders();
app.UseErrorHandling();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

var api = app.MapGroup("/api");
api.MapAuthEndpoints();
api.MapTripEndpoints();
api.MapCategoryEndpoints();
api.MapItemEndpoints();
api.MapBagEndpoints();
api.MapTemplateEndpoints();

// Systémové šablony jsou součástí produktu, ne uživatelských dat – seed je idempotentní.
await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SystemTemplateSeeder.SeedAsync(db);
}

app.Run();

// Viditelné pro WebApplicationFactory v integračních testech.
public partial class Program { }
