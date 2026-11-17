using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Packer.Infrastructure.Persistence;

namespace Packer.Api.IntegrationTests;

/// <summary>
/// Skutečná Postgres databáze pro integrační testy. Žádná in-memory náhrada:
/// testy mají projít stejnými migracemi, snake_case mapováním i Npgsql překladem dotazů
/// jako produkce. Databáze se před každým během zahodí a znovu zmigruje.
/// </summary>
internal static class TestDatabase
{
    /// <summary>Stejné přihlašovací údaje jako <c>deploy/compose.dev.yaml</c> – žádný nový secret.</summary>
    private const string LocalConnectionString =
        "Host=localhost;Port=5442;Database=packer_tests;Username=packer;Password=packer";

    /// <summary>
    /// <c>PACKER_TEST_DB</c> přebíjí lokální výchozí hodnotu (CI používá jiný port).
    /// </summary>
    public static string ConnectionString { get; } =
        Environment.GetEnvironmentVariable("PACKER_TEST_DB") ?? LocalConnectionString;

    public static void Reset()
    {
        var database = ReadDatabaseName();

        // Pojistka: Reset() databázi maže. Nikdy nesmí trefit vývojovou nebo produkční.
        if (!database.Contains("test", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"PACKER_TEST_DB points at database '{database}', which does not look like a test database. "
                + "Integration tests drop and recreate it on every run, so the name must contain 'test'.");
        }

        try
        {
            using var db = CreateContext();

            // Čistý start: migrace od nuly a prázdné tabulky. Systémové šablony
            // doseeduje start API, takže testy vidí stejný stav jako produkce.
            db.Database.EnsureDeleted();
            db.Database.Migrate();
        }
        catch (Exception exception)
        {
            throw new InvalidOperationException(
                $"Integration tests could not prepare database '{database}' on host '{ReadHost()}'. "
                + "Start the development database with "
                + "`podman compose -f deploy/compose.dev.yaml up -d` "
                + "or point PACKER_TEST_DB at another Postgres instance.",
                exception);
        }
    }

    private static AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .UseSnakeCaseNamingConvention()
            .Options);

    private static string ReadDatabaseName() => ReadSetting("Database") ?? string.Empty;

    private static string ReadHost() => ReadSetting("Host") ?? "(unknown)";

    private static string? ReadSetting(string key)
    {
        var builder = new DbConnectionStringBuilder { ConnectionString = ConnectionString };

        return builder.TryGetValue(key, out var value) ? value?.ToString() : null;
    }
}
