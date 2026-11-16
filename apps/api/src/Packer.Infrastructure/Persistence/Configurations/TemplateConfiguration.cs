using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Packer.Domain.Templates;

namespace Packer.Infrastructure.Persistence.Configurations;

internal sealed class TemplateConfiguration : IEntityTypeConfiguration<Template>
{
    public void Configure(EntityTypeBuilder<Template> builder)
    {
        builder.HasKey(template => template.Id);

        builder.Property(template => template.Name)
            .HasMaxLength(Template.NameMaxLength)
            .IsRequired();

        builder.Property(template => template.Description)
            .HasMaxLength(Template.DescriptionMaxLength);

        builder.Property(template => template.Icon)
            .HasMaxLength(Template.IconMaxLength)
            .IsRequired();

        builder.Property(template => template.Accent)
            .HasMaxLength(Template.AccentMaxLength)
            .IsRequired();

        // Mazání uživatele smaže i jeho šablony. SetNull by z osobních šablon udělalo
        // systémové, což je horší než ztráta dat.
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(template => template.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(template => template.Items)
            .WithOne()
            .HasForeignKey(item => item.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(template => template.Items).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(template => template.OwnerId);
    }
}
