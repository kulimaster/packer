using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.CreateItem;

public sealed class CreateItemRequestValidator : AbstractValidator<CreateItemRequest>
{
    public CreateItemRequestValidator()
    {
        RuleFor(request => request.Title)
            .NotEmpty()
            .MaximumLength(Item.TitleMaxLength);

        RuleFor(request => request.Note)
            .MaximumLength(Item.NoteMaxLength);

        RuleFor(request => request.Quantity)
            .InclusiveBetween(1, Item.QuantityMax);

        RuleFor(request => request.WeightGrams)
            .InclusiveBetween(0, Item.WeightGramsMax)
            .When(request => request.WeightGrams.HasValue);
    }
}
