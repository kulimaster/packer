namespace Packer.Application.Templates.DuplicateTemplate;

/// <summary>
/// Kopie šablony. Prázdný název znamená „použij název předlohy“; klient posílá
/// vlastní název s příponou, aby kopie v knihovně nesplynula s originálem.
/// </summary>
public sealed record DuplicateTemplateRequest(string? Name);
