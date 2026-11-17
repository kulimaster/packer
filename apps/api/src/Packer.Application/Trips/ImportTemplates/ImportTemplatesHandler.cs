using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Application.Templates;
using Packer.Domain.Templates;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.ImportTemplates;

/// <summary>
/// Import šablon do výletu: pro každou <c>CategoryName</c> najde nebo založí kategorii
/// a vloží položky na konec. Duplicity se záměrně neřeší – dvě "Passport" položky jsou
/// legitimní a případný merge je v2 (docs/domain-model.md).
/// </summary>
public sealed record ImportTemplatesResult(
    Guid TripId,
    IReadOnlyList<string> TemplateNames,
    int CategoriesCreated,
    int ItemsCreated);

public sealed class ImportTemplatesHandler(
    IAppDbContext db,
    IClock clock,
    ICurrentUser currentUser,
    IValidator<ImportTemplatesRequest> validator)
{
    public async Task<ImportTemplatesResult> HandleAsync(
        Guid tripId,
        ImportTemplatesRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var userId = currentUser.UserId;

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == tripId && trip.OwnerId == userId),
            cancellationToken);

        var trip = trips.SingleOrDefault() ?? throw NotFoundException.For("trip");

        var templateIds = request.TemplateIds!.Distinct().ToList();

        var templates = await db.ToListAsync(
            db.TemplatesAvailableTo(userId)
                .Where(template => templateIds.Contains(template.Id))
                .OrderBy(template => template.Name),
            cancellationToken);

        // Některá šablona neexistuje nebo patří jinému uživateli – chová se jako neexistující.
        if (templates.Count != templateIds.Count)
        {
            throw NotFoundException.For("template");
        }

        // Archivovaný výlet se needituje; Touch vyhodí trip_archived (409) dřív, než se cokoli vloží.
        trip.Touch(clock.UtcNow);

        var templateItems = await db.ToListAsync(
            db.TemplateItems
                .Where(item => templateIds.Contains(item.TemplateId))
                .OrderBy(item => item.Position),
            cancellationToken);

        var itemsByTemplate = templateItems
            .GroupBy(item => item.TemplateId)
            .ToDictionary(group => group.Key, group => group.ToList());

        var categories = await db.ToListAsync(
            db.Categories.Where(category => category.TripId == tripId).OrderBy(category => category.Position),
            cancellationToken);

        var categoryIds = categories.Select(category => category.Id).ToList();

        List<Item> existingItems = categoryIds.Count == 0
            ? []
            : await db.ToListAsync(
                db.Items.Where(item => categoryIds.Contains(item.CategoryId)),
                cancellationToken);

        var categoryByName = categories
            .GroupBy(category => category.Name, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => group.First(),
                StringComparer.OrdinalIgnoreCase);

        var nextCategoryPosition = categories.Count == 0 ? 0 : categories.Max(category => category.Position) + 1;

        var nextItemPosition = existingItems
            .GroupBy(item => item.CategoryId)
            .ToDictionary(
                group => group.Key,
                group => group.Max(item => item.Position) + 1);

        var categoriesCreated = 0;
        var itemsCreated = 0;

        foreach (var template in templates)
        {
            foreach (var templateItem in itemsByTemplate.GetValueOrDefault(template.Id) ?? [])
            {
                if (!categoryByName.TryGetValue(templateItem.CategoryName, out var category))
                {
                    category = Category.Create(
                        tripId,
                        bagId: null,
                        templateItem.CategoryName,
                        template.Icon,
                        note: null,
                        maxWeightKg: null,
                        nextCategoryPosition++);

                    db.Add(category);
                    categoryByName[templateItem.CategoryName] = category;
                    categoriesCreated++;
                }

                var position = nextItemPosition.GetValueOrDefault(category.Id);
                var item = Item.Create(
                    category.Id,
                    templateItem.Title,
                    templateItem.Note,
                    templateItem.Quantity,
                    templateItem.IsEssential,
                    templateItem.Flags,
                    templateItem.WeightGrams,
                    position);

                db.Add(item);
                nextItemPosition[category.Id] = position + 1;
                itemsCreated++;
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        return new ImportTemplatesResult(
            trip.Id,
            templates.Select(template => template.Name).ToList(),
            categoriesCreated,
            itemsCreated);
    }
}
