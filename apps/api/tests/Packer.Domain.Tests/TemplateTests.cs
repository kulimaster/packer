using Packer.Domain.Templates;
using Packer.Domain.Trips;

namespace Packer.Domain.Tests;

public sealed class TemplateTests
{
    private static Template CreateTemplate(Guid? ownerId = null) =>
        Template.Create(ownerId, "Airplane Carry-on", "Everything for the cabin", "plane", "mint");

    [Fact]
    public void Create_SystemTemplate_HasNoOwner()
    {
        var template = CreateTemplate();

        Assert.Null(template.OwnerId);
        Assert.Empty(template.Items);
    }

    [Fact]
    public void Create_RejectsEmptyOwner()
    {
        var code = DomainErrors.CodeOf(() => CreateTemplate(Guid.Empty));

        Assert.Equal("template_owner_required", code);
    }

    [Fact]
    public void AddItem_AppendsWithIncreasingPosition()
    {
        var template = CreateTemplate();

        var first = template.AddItem("Documents", "Passport", null, 1, true, ItemTraits.CarryOnOnly, 30);
        var second = template.AddItem("Documents", "Visa", null, 1, false, ItemTraits.None, 5);

        Assert.Equal(0, first.Position);
        Assert.Equal(1, second.Position);
        Assert.Equal(template.Id, first.TemplateId);
        Assert.Equal(2, template.Items.Count);
    }

    [Fact]
    public void RemoveItem_ReindexesRemainingItems()
    {
        var template = CreateTemplate();
        template.AddItem("Documents", "Passport", null, 1, true, ItemTraits.None, null);
        var middle = template.AddItem("Documents", "Visa", null, 1, false, ItemTraits.None, null);
        var last = template.AddItem("Documents", "Insurance", null, 1, false, ItemTraits.None, null);

        template.RemoveItem(middle);

        Assert.Equal(2, template.Items.Count);
        Assert.Equal(0, template.Items.First().Position);
        Assert.Equal(1, last.Position);
    }

    [Fact]
    public void RemoveItem_RejectsForeignItem()
    {
        var template = CreateTemplate();
        var other = CreateTemplate();
        var foreign = other.AddItem("Documents", "Passport", null, 1, false, ItemTraits.None, null);

        var code = DomainErrors.CodeOf(() => template.RemoveItem(foreign));

        Assert.Equal("template_item_missing", code);
    }

    [Fact]
    public void AddItem_RequiresCategoryName()
    {
        var template = CreateTemplate();

        var code = DomainErrors.CodeOf(
            () => template.AddItem(" ", "Passport", null, 1, false, ItemTraits.None, null));

        Assert.Equal("template_item_category_required", code);
    }
}
