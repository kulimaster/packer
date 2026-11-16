using Packer.Domain.Trips;

namespace Packer.Domain.Tests;

public sealed class TripStatusRulesTests
{
    [Theory]
    [InlineData(0, 0, TripStatus.NotStarted)]
    [InlineData(0, 5, TripStatus.NotStarted)]
    [InlineData(2, 5, TripStatus.InProgress)]
    [InlineData(5, 5, TripStatus.Ready)]
    public void Determine_WithoutArchive(int packed, int total, TripStatus expected)
    {
        Assert.Equal(expected, TripStatusRules.Determine(false, packed, total));
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(0, 5)]
    [InlineData(3, 5)]
    [InlineData(5, 5)]
    public void Determine_ArchiveWins(int packed, int total)
    {
        Assert.Equal(TripStatus.Archived, TripStatusRules.Determine(true, packed, total));
    }
}
