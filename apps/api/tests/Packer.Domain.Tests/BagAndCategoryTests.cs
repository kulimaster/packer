using Packer.Domain.Trips;

namespace Packer.Domain.Tests;

public sealed class BagAndCategoryTests
{
    private static readonly Guid TripId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    [Fact]
    public void Bag_Create_TrimsName()
    {
        var bag = Bag.Create(TripId, "  Peak Design 30L  ", BagKind.CarryOn, 10m, 0);

        Assert.Equal("Peak Design 30L", bag.Name);
        Assert.Equal(BagKind.CarryOn, bag.Kind);
        Assert.Equal(10m, bag.AllowanceKg);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public void Bag_Create_RejectsAllowanceOutOfRange(int allowance)
    {
        var code = DomainErrors.CodeOf(
            () => Bag.Create(TripId, "Peak Design", BagKind.Checked, allowance, 0));

        Assert.Equal("bag_allowance_out_of_range", code);
    }

    [Fact]
    public void Bag_Create_AllowsUnknownAllowance()
    {
        var bag = Bag.Create(TripId, "Personal", BagKind.Personal, null, 0);

        Assert.Null(bag.AllowanceKg);
    }

    [Fact]
    public void Category_Create_RequiresIcon()
    {
        var code = DomainErrors.CodeOf(
            () => Category.Create(TripId, null, "Electronics", "  ", null, null, 0));

        Assert.Equal("category_icon_required", code);
    }

    [Fact]
    public void Category_Create_RejectsEmptyBagId()
    {
        var code = DomainErrors.CodeOf(
            () => Category.Create(TripId, Guid.Empty, "Electronics", "laptop", null, null, 0));

        Assert.Equal("category_bag_required", code);
    }

    [Fact]
    public void Category_Update_CanDetachFromBag()
    {
        var bag = Bag.Create(TripId, "Carry-on", BagKind.CarryOn, null, 0);
        var category = Category.Create(TripId, bag.Id, "Electronics", "laptop", null, 3m, 0);

        category.Update(null, "Electronics & Tech", "laptop", "Under-seat daypack", 3.5m);

        Assert.Null(category.BagId);
        Assert.Equal("Electronics & Tech", category.Name);
        Assert.Equal(3.5m, category.MaxWeightKg);
    }

    [Fact]
    public void Category_Create_RejectsTooLongNote()
    {
        var note = new string('n', Category.NoteMaxLength + 1);

        var code = DomainErrors.CodeOf(
            () => Category.Create(TripId, null, "Electronics", "laptop", note, null, 0));

        Assert.Equal("category_note_too_long", code);
    }
}
