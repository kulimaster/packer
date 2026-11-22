namespace Packer.Application.Templates.UpdateTemplate;

/// <summary>Úprava metadat vlastní šablony. Položky se upravují importem, ne tady.</summary>
public sealed record UpdateTemplateRequest(
    string? Name,
    string? Description,
    string? Icon,
    string? Accent);
