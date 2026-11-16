using Packer.Domain.Trips;

namespace Packer.Application.Trips;

/// <summary>
/// Karta výletu v seznamu. <see cref="Status"/> je odvozený (viz docs/domain-model.md),
/// <see cref="PackedCount"/> / <see cref="TotalCount"/> se počítají dotazem, nikdy neukládají.
/// </summary>
public sealed record TripSummary(
    Guid Id,
    string Title,
    string? Destination,
    string? CoverImage,
    DateOnly? StartDate,
    DateOnly? EndDate,
    bool IsArchived,
    TripStatus Status,
    int PackedCount,
    int TotalCount);
