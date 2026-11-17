namespace Packer.Api.IntegrationTests;

/// <summary>
/// Jedna databáze a jeden host pro celou sadu – třídy proto běží sekvenčně.
/// Data mezi testy se neuklízí: každý test si zakládá vlastního uživatele,
/// takže se navzájem nevidí (vlastnictví je hranice viditelnosti).
/// </summary>
[CollectionDefinition(Name)]
public sealed class ApiCollectionDefinition : ICollectionFixture<PackerApiFactory>
{
    public const string Name = "api";
}
