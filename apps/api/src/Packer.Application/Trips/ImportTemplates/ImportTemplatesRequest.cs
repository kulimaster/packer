namespace Packer.Application.Trips.ImportTemplates;

/// <summary>Import jedné nebo více šablon do existujícího výletu.</summary>
public sealed record ImportTemplatesRequest(IReadOnlyList<Guid>? TemplateIds);
