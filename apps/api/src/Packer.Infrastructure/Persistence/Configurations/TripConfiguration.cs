using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Packer.Domain.Trips;

namespace Packer.Infrastructure.Persistence.Configurations;

internal sealed class TripConfiguration : IEntityTypeConfiguration<Trip>
{
    public void Configure(EntityTypeBuilder<Trip> builder)
    {
        builder.HasKey(trip => trip.Id);

        builder.Property(trip => trip.Title)
            .HasMaxLength(Trip.TitleMaxLength)
            .IsRequired();

        builder.Property(trip => trip.Destination)
            .HasMaxLength(Trip.DestinationMaxLength);

        // Klíč fotky z frontendového registru, ne URL – viz docs/domain-model.md.
        builder.Property(trip => trip.CoverImage)
            .HasMaxLength(Trip.CoverImageMaxLength);

        builder.Property(trip => trip.CreatedAt).IsRequired();
        builder.Property(trip => trip.UpdatedAt).IsRequired();

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(trip => trip.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(trip => trip.OwnerId);

        builder.HasMany(trip => trip.Bags)
            .WithOne()
            .HasForeignKey(bag => bag.TripId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(trip => trip.Bags).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(trip => trip.Categories)
            .WithOne()
            .HasForeignKey(category => category.TripId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(trip => trip.Categories).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
