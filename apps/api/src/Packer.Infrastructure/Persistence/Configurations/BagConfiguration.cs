using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Packer.Domain.Trips;

namespace Packer.Infrastructure.Persistence.Configurations;

internal sealed class BagConfiguration : IEntityTypeConfiguration<Bag>
{
    public void Configure(EntityTypeBuilder<Bag> builder)
    {
        builder.HasKey(bag => bag.Id);

        builder.Property(bag => bag.Name)
            .HasMaxLength(Bag.NameMaxLength)
            .IsRequired();

        builder.Property(bag => bag.Kind)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(bag => bag.AllowanceKg)
            .HasPrecision(5, 2);

        builder.HasIndex(bag => new { bag.TripId, bag.Position });
    }
}
