namespace Packer.Application.Trips.CreateTrip;

/// <summary>Vstup pro založení výletu. Vlastníka a časy doplní handler, klient je neposílá.</summary>
public sealed record CreateTripRequest(
    string? Title,
    string? Destination,
    string? CoverImage,
    DateOnly? StartDate,
    DateOnly? EndDate);
