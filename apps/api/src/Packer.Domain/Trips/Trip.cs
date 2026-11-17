using Packer.Domain.Common;

namespace Packer.Domain.Trips;

/// <summary>
/// Výlet – kořen agregátu pro bagy, kategorie a položky.
/// Archivovaný výlet je jen ke čtení (a odarchivování); invarianty se proto kontrolují
/// v každé mutující metodě, ne až v use case.
/// </summary>
public sealed class Trip
{
    public const int TitleMaxLength = 120;
    public const int DestinationMaxLength = 160;
    public const int CoverImageMaxLength = 60;

    private readonly List<Bag> _bags = [];
    private readonly List<Category> _categories = [];

    // Pro EF Core – entita se mimo persistence nevytváří "naprázdno".
    private Trip() { }

    public Guid Id { get; private set; }

    public Guid OwnerId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string? Destination { get; private set; }

    /// <summary>Klíč fotky z frontendového registru <c>covers</c>, ne URL.</summary>
    public string? CoverImage { get; private set; }

    public DateOnly? StartDate { get; private set; }

    public DateOnly? EndDate { get; private set; }

    public bool IsArchived { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset UpdatedAt { get; private set; }

    public IReadOnlyCollection<Bag> Bags => _bags;

    public IReadOnlyCollection<Category> Categories => _categories;

    public static Trip Create(
        Guid ownerId,
        string? title,
        string? destination,
        string? coverImage,
        DateOnly? startDate,
        DateOnly? endDate,
        DateTimeOffset now)
    {
        DomainGuard.RequiredId(ownerId, "trip_owner", nameof(ownerId));
        var (validStart, validEnd) = ValidateDates(startDate, endDate);

        return new Trip
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Title = DomainGuard.RequiredText(title, TitleMaxLength, "trip_title", nameof(title)),
            Destination = DomainGuard.OptionalText(
                destination,
                DestinationMaxLength,
                "trip_destination",
                nameof(destination)),
            CoverImage = DomainGuard.OptionalText(
                coverImage,
                CoverImageMaxLength,
                "trip_cover",
                nameof(coverImage)),
            StartDate = validStart,
            EndDate = validEnd,
            IsArchived = false,
            CreatedAt = now,
            UpdatedAt = now,
        };
    }

    /// <summary>Upraví editovatelné údaje. Na archivovaném výletu vyhodí <c>trip_archived</c>.</summary>
    public void Update(
        string? title,
        string? destination,
        string? coverImage,
        DateOnly? startDate,
        DateOnly? endDate,
        DateTimeOffset now)
    {
        EnsureEditable();

        var (validStart, validEnd) = ValidateDates(startDate, endDate);

        Title = DomainGuard.RequiredText(title, TitleMaxLength, "trip_title", nameof(title));
        Destination = DomainGuard.OptionalText(
            destination,
            DestinationMaxLength,
            "trip_destination",
            nameof(destination));
        CoverImage = DomainGuard.OptionalText(
            coverImage,
            CoverImageMaxLength,
            "trip_cover",
            nameof(coverImage));
        StartDate = validStart;
        EndDate = validEnd;
        UpdatedAt = now;
    }

    public void Archive(DateTimeOffset now)
    {
        if (IsArchived)
        {
            return;
        }

        IsArchived = true;
        UpdatedAt = now;
    }

    public void Unarchive(DateTimeOffset now)
    {
        if (!IsArchived)
        {
            return;
        }

        IsArchived = false;
        UpdatedAt = now;
    }

    /// <summary>
    /// Zaznamená změnu uvnitř výletu (kategorie, položka). Drží pořadí v seznamu podle
    /// naposledy upraveného výletu. Archivovaný výlet se needituje, takže vyhodí stejně jako <see cref="Update"/>.
    /// </summary>
    public void Touch(DateTimeOffset now)
    {
        EnsureEditable();
        UpdatedAt = now;
    }

    private void EnsureEditable()
    {
        if (IsArchived)
        {
            throw new DomainException("trip_archived", "Archived trip cannot be edited.");
        }
    }

    private static (DateOnly? Start, DateOnly? End) ValidateDates(DateOnly? startDate, DateOnly? endDate)
    {
        if (startDate is not null && endDate is not null && endDate < startDate)
        {
            throw new DomainException("trip_dates_invalid", "End date must not be before start date.");
        }

        return (startDate, endDate);
    }
}
