using Packer.Domain.Trips;

namespace Packer.Domain.Tests;

public sealed class ItemTests
{
    private static readonly Guid CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly DateTimeOffset Now = new(2026, 3, 1, 10, 0, 0, TimeSpan.Zero);

    private static Item CreateItem(int quantity = 1, int? weightGrams = 250) =>
        Item.Create(
            CategoryId,
            "Passport",
            "Check validity > 6 months",
            quantity,
            true,
            ItemTraits.CarryOnOnly,
            weightGrams,
            0);

    [Fact]
    public void Create_StartsUnpacked()
    {
        var item = CreateItem();

        Assert.False(item.IsPacked);
        Assert.Null(item.PackedAt);
        Assert.Equal(1, item.Quantity);
        Assert.True(item.IsEssential);
        Assert.Equal(ItemTraits.CarryOnOnly, item.Flags);
    }

    [Fact]
    public void SetPacked_True_StoresTimestamp()
    {
        var item = CreateItem();

        item.SetPacked(true, Now);

        Assert.True(item.IsPacked);
        Assert.Equal(Now, item.PackedAt);
    }

    [Fact]
    public void SetPacked_False_ClearsTimestamp()
    {
        var item = CreateItem();
        item.SetPacked(true, Now);

        item.SetPacked(false, Now.AddMinutes(5));

        Assert.False(item.IsPacked);
        Assert.Null(item.PackedAt);
    }

    [Fact]
    public void SetPacked_RepeatedSameState_KeepsOriginalTimestamp()
    {
        var item = CreateItem();
        item.SetPacked(true, Now);

        item.SetPacked(true, Now.AddHours(2));

        Assert.Equal(Now, item.PackedAt);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    [InlineData(Item.QuantityMax + 1)]
    public void Create_RejectsQuantityOutOfRange(int quantity)
    {
        var code = DomainErrors.CodeOf(() => CreateItem(quantity));

        Assert.Equal("item_quantity_out_of_range", code);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(Item.WeightGramsMax + 1)]
    public void Create_RejectsWeightOutOfRange(int weightGrams)
    {
        var code = DomainErrors.CodeOf(() => CreateItem(weightGrams: weightGrams));

        Assert.Equal("item_weight_out_of_range", code);
    }

    [Fact]
    public void Create_AllowsNullWeight()
    {
        var item = CreateItem(weightGrams: null);

        Assert.Null(item.WeightGrams);
    }

    [Fact]
    public void Create_TrimsTitleAndNote()
    {
        var item = Item.Create(
            CategoryId,
            "  Passport  ",
            "  Valid > 6 months  ",
            1,
            false,
            ItemTraits.None,
            null,
            0);

        Assert.Equal("Passport", item.Title);
        Assert.Equal("Valid > 6 months", item.Note);
    }

    [Fact]
    public void Create_RejectsEmptyCategory()
    {
        var code = DomainErrors.CodeOf(
            () => Item.Create(Guid.Empty, "Passport", null, 1, false, ItemTraits.None, null, 0));

        Assert.Equal("item_category_required", code);
    }

    [Fact]
    public void Update_ReplacesEditableFields()
    {
        var item = CreateItem();

        item.Update("Passport (2x)", null, 2, false, ItemTraits.None, 100);

        Assert.Equal("Passport (2x)", item.Title);
        Assert.Null(item.Note);
        Assert.Equal(2, item.Quantity);
        Assert.False(item.IsEssential);
        Assert.Equal(100, item.WeightGrams);
    }

    [Fact]
    public void MoveTo_RejectsNegativePosition()
    {
        var item = CreateItem();

        var code = DomainErrors.CodeOf(() => item.MoveTo(-1));

        Assert.Equal("item_position_out_of_range", code);
        Assert.Equal(0, item.Position);
    }
}
