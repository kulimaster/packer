using Packer.Api.Common;
using Packer.Application.Trips;
using Packer.Application.Trips.AssignCategoryBag;
using Packer.Application.Trips.CreateBag;
using Packer.Application.Trips.DeleteBag;
using Packer.Application.Trips.UpdateBag;

namespace Packer.Api.Trips;

internal static class BagEndpoints
{
    public static IEndpointRouteBuilder MapBagEndpoints(this IEndpointRouteBuilder app)
    {
        var create = app.MapGroup("/trips/{tripId:guid}/bags")
            .RequireAuthorization();

        create.MapPost("/", async (
            Guid tripId,
            CreateBagRequest request,
            CreateBagHandler handler,
            CancellationToken cancellationToken) =>
        {
            var bag = await handler.HandleAsync(tripId, request, cancellationToken);

            return Results.Created($"/api/bags/{bag.Id}", bag);
        })
            .Produces<BagDetails>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        var bags = app.MapGroup("/bags")
            .RequireAuthorization();

        bags.MapPut("/{bagId:guid}", async (
            Guid bagId,
            UpdateBagRequest request,
            UpdateBagHandler handler,
            CancellationToken cancellationToken) =>
        {
            var bag = await handler.HandleAsync(bagId, request, cancellationToken);

            return Results.Ok(bag);
        })
            .Produces<BagDetails>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        bags.MapDelete("/{bagId:guid}", async (
            Guid bagId,
            DeleteBagHandler handler,
            CancellationToken cancellationToken) =>
        {
            await handler.HandleAsync(bagId, cancellationToken);

            return Results.NoContent();
        })
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        var categories = app.MapGroup("/categories/{categoryId:guid}/bag")
            .RequireAuthorization();

        categories.MapPut("/", async (
            Guid categoryId,
            AssignCategoryBagRequest request,
            AssignCategoryBagHandler handler,
            CancellationToken cancellationToken) =>
        {
            var category = await handler.HandleAsync(categoryId, request, cancellationToken);

            return Results.Ok(category);
        })
            .Produces<CategoryDetails>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        return app;
    }
}
