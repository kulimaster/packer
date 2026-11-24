using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Templates;
using Packer.Domain.Trips;

namespace Packer.Application.Templates.GetTemplate;

/// <summary>Detail šablony pro náhled před importem – všechny položky seřazené podle pořadí.</summary>
public sealed record TemplateDetails(
    Guid Id,
    string Name,
    string? Description,
    string Icon,
    string Accent,
    bool IsSystem,
    int EstimatedWeightGrams,
    IReadOnlyList<TemplateItemDetails> Items);

public sealed record TemplateItemDetails(
    Guid Id,
    string CategoryName,
    string Title,
    string? Note,
    int Quantity,
    bool IsEssential,
    ItemTraits Flags,
    int? WeightGrams,
    int EstimatedWeightGrams)
{
    public static TemplateItemDetails From(TemplateItem item) =>
        new(
            item.Id,
            item.CategoryName,
            item.Title,
            item.Note,
            item.Quantity,
            item.IsEssential,
            item.Flags,
            item.WeightGrams,
            (item.WeightGrams ?? 0) * item.Quantity);
}

public sealed class GetTemplateHandler(IAppDbContext db, ICurrentUser currentUser)
{
    public async Task<TemplateDetails> HandleAsync(Guid templateId, CancellationToken cancellationToken)
    {
        var templates = await db.ToListAsync(
            db.TemplatesAvailableTo(currentUser.UserId).Where(template => template.Id == templateId),
            cancellationToken);

        var template = templates.SingleOrDefault() ?? throw NotFoundException.For("template");

        var items = await db.ToListAsync(
            db.TemplateItems
                .Where(item => item.TemplateId == templateId)
                .OrderBy(item => item.Position),
            cancellationToken);

        var itemDetails = items
            .Select(TemplateItemDetails.From)
            .ToList();

        return new TemplateDetails(
            template.Id,
            template.Name,
            template.Description,
            template.Icon,
            template.Accent,
            template.OwnerId is null,
            itemDetails.Sum(item => item.EstimatedWeightGrams),
            itemDetails);
    }
}
