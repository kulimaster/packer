using Packer.Api.Common;
using Packer.Application.Trips;
using Packer.Application.Trips.CreateTrip;
using Packer.Application.Trips.GetTrips;

namespace Packer.Api.Trips;

internal static class TripEndpoints
{
    public static IEndpointRouteBuilder MapTripEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/trips")
            .RequireAuthorization();

        group.MapGet("/", async (
            bool? includeArchived,
            GetTripsHandler handler,
            CancellationToken cancellationToken) =>
        {
            var trips = await handler.HandleAsync(
                new GetTripsQuery(includeArchived ?? false),
                cancellationToken);

            return Results.Ok(trips);
        })
            .Produces<IReadOnlyList<TripSummary>>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized);

        group.MapPost("/", async (
            CreateTripRequest request,
            CreateTripHandler handler,
            CancellationToken cancellationToken) =>
        {
            var trip = await handler.HandleAsync(request, cancellationToken);

            return Results.Created($"/api/trips/{trip.Id}", trip);
        })
            .Produces<TripSummary>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .AddEndpointFilter<AntiforgeryFilter>();

        return app;
    }
}
