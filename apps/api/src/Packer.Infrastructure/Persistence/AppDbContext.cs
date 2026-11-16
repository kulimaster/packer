using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Packer.Application.Common;
using Packer.Domain.Templates;
using Packer.Domain.Trips;

namespace Packer.Infrastructure.Persistence;

/// <summary>
/// Jediná implementace <see cref="IAppDbContext"/>. DbContext je zároveň repository
/// i unit of work – žádný <c>IRepository&lt;T&gt;</c> ani <c>UnitOfWork</c> (viz AGENTS.md).
/// </summary>
public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options), IAppDbContext
{
    public DbSet<Trip> Trips => Set<Trip>();

    public DbSet<Bag> Bags => Set<Bag>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Item> Items => Set<Item>();

    public DbSet<Template> Templates => Set<Template>();

    public DbSet<TemplateItem> TemplateItems => Set<TemplateItem>();

    IQueryable<Trip> IAppDbContext.Trips => Trips;

    IQueryable<Bag> IAppDbContext.Bags => Bags;

    IQueryable<Category> IAppDbContext.Categories => Categories;

    IQueryable<Item> IAppDbContext.Items => Items;

    IQueryable<Template> IAppDbContext.Templates => Templates;

    IQueryable<TemplateItem> IAppDbContext.TemplateItems => TemplateItems;

    // Explicitní implementace – DbContext už Add/Remove má (s návratovou hodnotou EntityEntry),
    // port z Application vrací void. Skrytí děděného člena by mátlo volající.
    void IAppDbContext.Add<TEntity>(TEntity entity) => Set<TEntity>().Add(entity);

    void IAppDbContext.Remove<TEntity>(TEntity entity) => Set<TEntity>().Remove(entity);

    public Task<List<T>> ToListAsync<T>(
        IQueryable<T> query,
        CancellationToken cancellationToken = default) =>
        EntityFrameworkQueryableExtensions.ToListAsync(query, cancellationToken);

    protected override void OnModelCreating(ModelBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        base.OnModelCreating(builder);

        // Konfigurace entit jsou v Persistence/Configurations, jedna třída na entitu.
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
