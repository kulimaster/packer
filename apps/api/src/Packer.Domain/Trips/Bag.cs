using Packer.Domain.Common;

namespace Packer.Domain.Trips;

/// <summary>
/// Zavazadlo výletu. <see cref="AllowanceKg"/> je limit od dopravce, ne hmotnost bagu samotného.
/// </summary>
public sealed class Bag
{
    public const int NameMaxLength = 80;
    public const decimal AllowanceMaxKg = 100m;

    // Pro EF Core.
    private Bag() { }

    public Guid Id { get; private set; }

    public Guid TripId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public BagKind Kind { get; private set; }

    public decimal? AllowanceKg { get; private set; }

    public int Position { get; private set; }

    public static Bag Create(
        Guid tripId,
        string? name,
        BagKind kind,
        decimal? allowanceKg,
        int position)
    {
        DomainGuard.RequiredId(tripId, "bag_trip", nameof(tripId));

        return new Bag
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            Name = DomainGuard.RequiredText(name, NameMaxLength, "bag_name", nameof(name)),
            Kind = kind,
            AllowanceKg = ValidateAllowance(allowanceKg),
            Position = DomainGuard.AtLeast(position, 0, "bag_position", nameof(position)),
        };
    }

    public void Update(string? name, BagKind kind, decimal? allowanceKg)
    {
        Name = DomainGuard.RequiredText(name, NameMaxLength, "bag_name", nameof(name));
        Kind = kind;
        AllowanceKg = ValidateAllowance(allowanceKg);
    }

    public void MoveTo(int position)
    {
        Position = DomainGuard.AtLeast(position, 0, "bag_position", nameof(position));
    }

    private static decimal? ValidateAllowance(decimal? allowanceKg)
    {
        var value = DomainGuard.OptionalNonNegative(allowanceKg, "bag_allowance", nameof(allowanceKg));

        if (value > AllowanceMaxKg)
        {
            throw new DomainException(
                "bag_allowance_out_of_range",
                $"Allowance must be at most {AllowanceMaxKg} kg.");
        }

        return value;
    }
}
