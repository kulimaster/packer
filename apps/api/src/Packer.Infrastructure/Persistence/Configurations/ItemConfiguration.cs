using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Packer.Domain.Trips;

namespace Packer.Infrastructure.Persistence.Configurations;

internal sealed class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.HasKey(item => item.Id);

        builder.Property(item => item.Title)
            .HasMaxLength(Item.TitleMaxLength)
            .IsRequired();

        builder.Property(item => item.Note)
            .HasMaxLength(Item.NoteMaxLength);

        // Bitová maska jako int – čitelné v DB, žádná další tabulka (docs/domain-model.md).
        builder.Property(item => item.Flags)
            .HasConversion<int>()
            .IsRequired();

        builder.HasIndex(item => new { item.CategoryId, item.Position });
    }
}
