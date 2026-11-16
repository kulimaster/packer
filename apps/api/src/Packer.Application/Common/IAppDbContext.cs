using Packer.Domain.Templates;
using Packer.Domain.Trips;

namespace Packer.Application.Common;

/// <summary>
/// Port nad perzistencí. Application vidí jen <see cref="IQueryable{T}"/> a <c>Add/Remove/SaveChanges</c>,
/// nikdy <c>DbSet</c> – jinak by se EF Core dostal do business logiky.
/// </summary>
public interface IAppDbContext
{
    IQueryable<Trip> Trips { get; }

    IQueryable<Bag> Bags { get; }

    IQueryable<Category> Categories { get; }

    IQueryable<Item> Items { get; }

    IQueryable<Template> Templates { get; }

    IQueryable<TemplateItem> TemplateItems { get; }

    void Add<TEntity>(TEntity entity)
        where TEntity : class;

    void Remove<TEntity>(TEntity entity)
        where TEntity : class;

    /// <summary>
    /// Materializuje dotaz. Application tak nemusí znát <c>ToListAsync</c> z EF Core –
    /// tohle je jediné místo, kde se na databázi čeká.
    /// </summary>
    Task<List<T>> ToListAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
