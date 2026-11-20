using Packer.Domain.Trips;

namespace Packer.Application.Trips.UpdateTrip;

/// <summary>Vstup pro úpravu výletu. Vlastníka a archivaci mění jiné operace.</summary>
public sealed record UpdateTripRequest(
    string? Title,
    string? Destination,
    string? CoverImage,
    DateOnly? StartDate,
    DateOnly? EndDate);
