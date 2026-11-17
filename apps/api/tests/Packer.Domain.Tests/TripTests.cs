using Packer.Domain.Trips;

namespace Packer.Domain.Tests;

public sealed class TripTests
{
    private static readonly DateTimeOffset Now = new(2026, 3, 1, 10, 0, 0, TimeSpan.Zero);
    private static readonly Guid Owner = Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public void Create_TrimsTitleAndDestination()
    {
        var trip = Trip.Create(Owner, "  Asia Vacation  ", "  Tokyo & Kyoto, Japan  ", null, null, null, Now);

        Assert.Equal("Asia Vacation", trip.Title);
        Assert.Equal("Tokyo & Kyoto, Japan", trip.Destination);
        Assert.False(trip.IsArchived);
        Assert.Equal(Now, trip.CreatedAt);
        Assert.Equal(Now, trip.UpdatedAt);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_RejectsMissingTitle(string? title)
    {
        var code = DomainErrors.CodeOf(
            () => Trip.Create(Owner, title, null, null, null, null, Now));

        Assert.Equal("trip_title_required", code);
    }

    [Fact]
    public void Create_RejectsTooLongTitle()
    {
        var title = new string('a', Trip.TitleMaxLength + 1);

        var code = DomainErrors.CodeOf(
            () => Trip.Create(Owner, title, null, null, null, null, Now));

        Assert.Equal("trip_title_too_long", code);
    }

    [Fact]
    public void Create_RejectsEndDateBeforeStartDate()
    {
        var code = DomainErrors.CodeOf(
            () => Trip.Create(
                Owner,
                "Asia",
                null,
                null,
                new DateOnly(2026, 5, 10),
                new DateOnly(2026, 5, 9),
                Now));

        Assert.Equal("trip_dates_invalid", code);
    }

    [Fact]
    public void Create_AllowsSameStartAndEndDate()
    {
        var day = new DateOnly(2026, 5, 10);

        var trip = Trip.Create(Owner, "Prague", null, null, day, day, Now);

        Assert.Equal(day, trip.StartDate);
        Assert.Equal(day, trip.EndDate);
    }

    [Fact]
    public void Create_RejectsEmptyOwner()
    {
        var code = DomainErrors.CodeOf(
            () => Trip.Create(Guid.Empty, "Asia", null, null, null, null, Now));

        Assert.Equal("trip_owner_required", code);
    }

    [Fact]
    public void Create_NormalizesBlankCoverToNull()
    {
        var trip = Trip.Create(Owner, "Asia", null, "   ", null, null, Now);

        Assert.Null(trip.CoverImage);
    }

    [Fact]
    public void Update_ChangesDatesAndBumpsTimestamp()
    {
        var trip = Trip.Create(Owner, "Asia", null, null, null, null, Now);
        var later = Now.AddHours(1);

        trip.Update("Japan", "Tokyo", "asia-tokyo", new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 9), later);

        Assert.Equal("Japan", trip.Title);
        Assert.Equal("Tokyo", trip.Destination);
        Assert.Equal("asia-tokyo", trip.CoverImage);
        Assert.Equal(later, trip.UpdatedAt);
        Assert.Equal(Now, trip.CreatedAt);
    }

    [Fact]
    public void Update_OnArchivedTrip_Throws()
    {
        var trip = Trip.Create(Owner, "Asia", null, null, null, null, Now);
        trip.Archive(Now);

        var code = DomainErrors.CodeOf(
            () => trip.Update("Japan", null, null, null, null, Now));

        Assert.Equal("trip_archived", code);
        Assert.Equal("Asia", trip.Title);
    }

    [Fact]
    public void Archive_IsIdempotent()
    {
        var trip = Trip.Create(Owner, "Asia", null, null, null, null, Now);
        trip.Archive(Now);
        var archivedAt = trip.UpdatedAt;

        trip.Archive(Now.AddDays(1));

        Assert.True(trip.IsArchived);
        Assert.Equal(archivedAt, trip.UpdatedAt);
    }

    [Fact]
    public void Touch_BumpsUpdatedAtOnly()
    {
        var trip = Trip.Create(Owner, "Asia", null, null, null, null, Now);
        var later = Now.AddHours(2);

        trip.Touch(later);

        Assert.Equal(later, trip.UpdatedAt);
        Assert.Equal(Now, trip.CreatedAt);
        Assert.Equal("Asia", trip.Title);
    }

    [Fact]
    public void Touch_OnArchivedTrip_Throws()
    {
        var trip = Trip.Create(Owner, "Asia", null, null, null, null, Now);
        trip.Archive(Now);
        var archivedAt = trip.UpdatedAt;

        var code = DomainErrors.CodeOf(() => trip.Touch(Now.AddHours(1)));

        Assert.Equal("trip_archived", code);
        Assert.Equal(archivedAt, trip.UpdatedAt);
    }

    [Fact]
    public void Unarchive_MakesTripEditableAgain()
    {
        var trip = Trip.Create(Owner, "Asia", null, null, null, null, Now);
        trip.Archive(Now);
        trip.Unarchive(Now.AddDays(1));

        trip.Update("Asia 2026", null, null, null, null, Now.AddDays(2));

        Assert.False(trip.IsArchived);
        Assert.Equal("Asia 2026", trip.Title);
    }
}
