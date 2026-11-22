namespace Packer.Application.Templates.CreateTemplate;

/// <summary>
/// Vytvoří vlastní šablonu z existujícího výletu – položky se zkopírují
/// a kategorie se změní na <c>CategoryName</c>. Ikona a barva jsou věc klienta.
/// </summary>
public sealed record CreateTemplateRequest(
    Guid TripId,
    string? Name,
    string? Description,
    string? Icon,
    string? Accent);
