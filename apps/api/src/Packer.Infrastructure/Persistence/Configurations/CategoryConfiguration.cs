using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Packer.Domain.Trips;

namespace Packer.Infrastructure.Persistence.Configurations;

internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(category => category.Id);

        builder.Property(category => category.Name)
            .HasMaxLength(Category.NameMaxLength)
            .IsRequired();

        builder.Property(category => category.Icon)
            .HasMaxLength(Category.IconMaxLength)
            .IsRequired();

        builder.Property(category => category.Note)
            .HasMaxLength(Category.NoteMaxLength);

        builder.Property(category => category.MaxWeightKg)
            .HasPrecision(5, 2);

        builder.HasOne<Bag>()
            .WithMany()
            .HasForeignKey(category => category.BagId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(category => new { category.TripId, category.Position });

        builder.HasMany(category => category.Items)
            .WithOne()
            .HasForeignKey(item => item.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(category => category.Items).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
