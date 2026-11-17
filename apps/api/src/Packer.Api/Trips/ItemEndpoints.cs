using Packer.Api.Common;
using Packer.Application.Trips;
using Packer.Application.Trips.CreateItem;
using Packer.Application.Trips.DeleteItem;
using Packer.Application.Trips.SetItemPacked;

namespace Packer.Api.Trips;

internal static class ItemEndpoints
{
    public static IEndpointRouteBuilder MapItemEndpoints(this IEndpointRouteBuilder app)
    {
        var create = app.MapGroup("/categories/{categoryId:guid}/items")
            .RequireAuthorization();

        create.MapPost("/", async (
            Guid categoryId,
            CreateItemRequest request,
            CreateItemHandler handler,
            CancellationToken cancellationToken) =>
        {
            var item = await handler.HandleAsync(categoryId, request, cancellationToken);

            return Results.Created($"/api/items/{item.Id}", item);
        })
            .Produces<ItemDetails>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        var items = app.MapGroup("/items")
            .RequireAuthorization();

        items.MapPatch("/{itemId:guid}/packed", async (
            Guid itemId,
            SetItemPackedRequest request,
            SetItemPackedHandler handler,
            CancellationToken cancellationToken) =>
        {
            var item = await handler.HandleAsync(itemId, request.IsPacked, cancellationToken);

            return Results.Ok(item);
        })
            .Produces<ItemDetails>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        items.MapDelete("/{itemId:guid}", async (
            Guid itemId,
            DeleteItemHandler handler,
            CancellationToken cancellationToken) =>
        {
            await handler.HandleAsync(itemId, cancellationToken);

            return Results.NoContent();
        })
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        return app;
    }
}
