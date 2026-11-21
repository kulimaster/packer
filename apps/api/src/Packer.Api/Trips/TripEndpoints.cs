using Packer.Api.Common;
using Packer.Application.Trips;
using Packer.Application.Trips.CreateTrip;
using Packer.Application.Trips.DeleteTrip;
using Packer.Application.Trips.DuplicateTrip;
using Packer.Application.Trips.GetTrip;
using Packer.Application.Trips.GetTrips;
using Packer.Application.Trips.SetTripArchived;
using Packer.Application.Trips.UpdateTrip;

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

        group.MapGet("/{tripId:guid}", async (
            Guid tripId,
            GetTripHandler handler,
            CancellationToken cancellationToken) =>
        {
            var trip = await handler.HandleAsync(tripId, cancellationToken);

            return Results.Ok(trip);
        })
            .Produces<TripDetails>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound);

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

        group.MapPut("/{tripId:guid}", async (
            Guid tripId,
            UpdateTripRequest request,
            UpdateTripHandler handler,
            CancellationToken cancellationToken) =>
        {
            var trip = await handler.HandleAsync(tripId, request, cancellationToken);

            return Results.Ok(trip);
        })
            .Produces<TripSummary>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        group.MapPost("/{tripId:guid}/duplicate", async (
            Guid tripId,
            DuplicateTripRequest request,
            DuplicateTripHandler handler,
            CancellationToken cancellationToken) =>
        {
            var trip = await handler.HandleAsync(tripId, request, cancellationToken);

            return Results.Created($"/api/trips/{trip.Id}", trip);
        })
            .Produces<TripSummary>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .AddEndpointFilter<AntiforgeryFilter>();

        group.MapDelete("/{tripId:guid}", async (
            Guid tripId,
            DeleteTripHandler handler,
            CancellationToken cancellationToken) =>
        {
            await handler.HandleAsync(tripId, cancellationToken);

            return Results.NoContent();
        })
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .AddEndpointFilter<AntiforgeryFilter>();

        group.MapPatch("/{tripId:guid}/archived", async (
            Guid tripId,
            SetTripArchivedRequest request,
            SetTripArchivedHandler handler,
            CancellationToken cancellationToken) =>
        {
            await handler.HandleAsync(tripId, request.IsArchived, cancellationToken);

            return Results.NoContent();
        })
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .AddEndpointFilter<AntiforgeryFilter>();

        return app;
    }
}
