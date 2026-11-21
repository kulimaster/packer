namespace Packer.Application.Trips.DuplicateTrip;

/// <summary>
/// Kopie výletu. Název posílá klient – text „(kopie)“ patří do i18n, ne do API.
/// Když se nepošle, použije se název předlohy.
/// </summary>
public sealed record DuplicateTripRequest(string? Title);
