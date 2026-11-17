namespace Packer.Application.Trips.SetTripArchived;

/// <summary>Archivace nebo obnovení výletu. Obě operace jsou idempotentní.</summary>
public sealed record SetTripArchivedRequest(bool IsArchived);
