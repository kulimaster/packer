using System.Text.Json;
using System.Text.Json.Serialization;

namespace Packer.Api.IntegrationTests;

/// <summary>
/// Nastavení serializace musí odpovídat kontraktu (docs/api-contract.md):
/// camelCase a enumy jako string. Stejné jako v <c>Program.cs</c>.
/// </summary>
internal static class ApiJson
{
    public static JsonSerializerOptions Options { get; } = CreateOptions();

    private static JsonSerializerOptions CreateOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter());

        return options;
    }
}
