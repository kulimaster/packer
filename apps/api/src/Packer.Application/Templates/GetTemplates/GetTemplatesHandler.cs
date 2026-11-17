using Packer.Application.Common;
using Packer.Domain.Templates;

namespace Packer.Application.Templates.GetTemplates;

/// <summary>
/// Karta šablony v knihovně. Počty a hmotnost jsou odvozené z položek, nikdy se neukládají.
/// <see cref="Categories"/> slouží k náhledu, do kterých sekcí import položky zařadí.
/// </summary>
public sealed record TemplateSummary(
    Guid Id,
    string Name,
    string? Description,
    string Icon,
    string Accent,
    bool IsSystem,
    int ItemCount,
    int EstimatedWeightGrams,
    IReadOnlyList<string> Categories);

public sealed class GetTemplatesHandler(IAppDbContext db, ICurrentUser currentUser)
{
    public async Task<IReadOnlyList<TemplateSummary>> HandleAsync(CancellationToken cancellationToken)
    {
        var templates = await db.ToListAsync(
            db.TemplatesAvailableTo(currentUser.UserId)
                .OrderBy(template => template.Name),
            cancellationToken);

        var templateIds = templates.Select(template => template.Id).ToList();

        List<TemplateItem> items = templateIds.Count == 0
            ? []
            : await db.ToListAsync(
                db.TemplateItems
                    .Where(item => templateIds.Contains(item.TemplateId))
                    .OrderBy(item => item.Position),
                cancellationToken);

        var itemsByTemplate = items
            .GroupBy(item => item.TemplateId)
            .ToDictionary(group => group.Key, group => group.ToList());

        return templates
            .Select(template =>
            {
                var templateItems = itemsByTemplate.GetValueOrDefault(template.Id) ?? [];

                return new TemplateSummary(
                    template.Id,
                    template.Name,
                    template.Description,
                    template.Icon,
                    template.Accent,
                    template.OwnerId is null,
                    templateItems.Count,
                    templateItems.Sum(item => (item.WeightGrams ?? 0) * item.Quantity),
                    templateItems
                        .Select(item => item.CategoryName)
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList());
            })
            .ToList();
    }
}
