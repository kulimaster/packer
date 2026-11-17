using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Logging;

namespace Packer.Api.IntegrationTests;

/// <summary>
/// Spustí reálné <c>Program.cs</c> v paměti (TestServer) nad testovací databází.
/// Connection string jde přes proměnnou prostředí, protože ji <c>Program.cs</c> čte
/// dřív, než by se stihla uplatnit konfigurace z <see cref="WebApplicationFactory"/>.
/// </summary>
public sealed class PackerApiFactory : WebApplicationFactory<Program>
{
    public PackerApiFactory()
    {
        Environment.SetEnvironmentVariable("ConnectionStrings__Default", TestDatabase.ConnectionString);

        TestDatabase.Reset();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Testing: nenačtou se user-secrets ani development větve (OpenAPI, logy).
        builder.UseEnvironment("Testing");

        // SQL logy na Information by zaplavily výstup testů; warningy a chyby zůstávají.
        builder.ConfigureLogging(logging => logging.SetMinimumLevel(LogLevel.Warning));
    }
}
