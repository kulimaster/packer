using FluentValidation;
using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateItem;

public sealed class UpdateItemRequestValidator : AbstractValidator<UpdateItemRequest>
{
    public UpdateItemRequestValidator()
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
