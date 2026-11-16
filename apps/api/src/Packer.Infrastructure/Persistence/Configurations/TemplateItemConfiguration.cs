using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Packer.Domain.Templates;

namespace Packer.Infrastructure.Persistence.Configurations;

internal sealed class TemplateItemConfiguration : IEntityTypeConfiguration<TemplateItem>
{
    public void Configure(EntityTypeBuilder<TemplateItem> builder)
    {
        builder.HasKey(item => item.Id);

        builder.Property(item => item.CategoryName)
            .HasMaxLength(TemplateItem.CategoryNameMaxLength)
            .IsRequired();

        builder.Property(item => item.Title)
            .HasMaxLength(TemplateItem.TitleMaxLength)
            .IsRequired();

        builder.Property(item => item.Note)
            .HasMaxLength(TemplateItem.NoteMaxLength);

        builder.Property(item => item.Flags)
            .HasConversion<int>()
            .IsRequired();

        builder.HasIndex(item => new { item.TemplateId, item.Position });
    }
}
