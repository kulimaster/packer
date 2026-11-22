using FluentValidation;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Application.Templates.GetTemplates;
using Packer.Domain.Templates;

namespace Packer.Application.Templates.CreateTemplate;

public sealed class CreateTemplateHandler(
    IAppDbContext db,
    ICurrentUser currentUser,
    IValidator<CreateTemplateRequest> validator)
{
    public async Task<TemplateSummary> HandleAsync(
        CreateTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
        {
            throw new ValidationFailedException(ValidationErrors.From(validation));
        }

        var userId = currentUser.UserId;

        var trips = await db.ToListAsync(
            db.Trips.Where(trip => trip.Id == request.TripId && trip.OwnerId == userId),
            cancellationToken);

        var _ = trips.SingleOrDefault() ?? throw NotFoundException.For("trip");

        var categories = await db.ToListAsync(
            db.Categories
                .Where(category => category.TripId == request.TripId)
                .OrderBy(category => category.Position),
            cancellationToken);

        var categoryIds = categories.Select(category => category.Id).ToList();

        var items = categoryIds.Count == 0
            ? []
            : await db.ToListAsync(
                db.Items
                    .Where(item => categoryIds.Contains(item.CategoryId))
                    .OrderBy(item => item.Position),
                cancellationToken);

        var categoryNames = categories.ToDictionary(category => category.Id, category => category.Name);
        var categoryOrder = categories
            .Select((category, index) => (category.Id, index))
            .ToDictionary(entry => entry.Id, entry => entry.index);

        var template = Template.Create(
            userId,
            request.Name,
            request.Description,
            request.Icon,
            request.Accent);

        // Šablona nemá balení ani bagy – jen položky s názvem cílové kategorie.
        // Řadíme po kategoriích, aby import z knihovny vypadal stejně jako výlet.
        foreach (var item in items
            .OrderBy(item => categoryOrder[item.CategoryId])
            .ThenBy(item => item.Position))
        {
            template.AddItem(
                categoryNames[item.CategoryId],
                item.Title,
                item.Note,
                item.Quantity,
                item.IsEssential,
                item.Flags,
                item.WeightGrams);
        }

        db.Add(template);
        await db.SaveChangesAsync(cancellationToken);

        return TemplateSummary.From(template, template.Items.ToList());
    }
}
