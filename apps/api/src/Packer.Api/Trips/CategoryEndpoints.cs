using Packer.Api.Common;
using Packer.Application.Trips;
using Packer.Application.Trips.CreateCategory;
using Packer.Application.Trips.DeleteCategory;
using Packer.Application.Trips.UpdateCategory;

namespace Packer.Api.Trips;

internal static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var create = app.MapGroup("/trips/{tripId:guid}/categories")
            .RequireAuthorization();

        create.MapPost("/", async (
            Guid tripId,
            CreateCategoryRequest request,
            CreateCategoryHandler handler,
            CancellationToken cancellationToken) =>
        {
            var category = await handler.HandleAsync(tripId, request, cancellationToken);

            return Results.Created($"/api/trips/{tripId}", category);
        })
            .Produces<CategoryDetails>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        var categories = app.MapGroup("/categories")
            .RequireAuthorization();

        categories.MapPut("/{categoryId:guid}", async (
            Guid categoryId,
            UpdateCategoryRequest request,
            UpdateCategoryHandler handler,
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

        categories.MapDelete("/{categoryId:guid}", async (
            Guid categoryId,
            DeleteCategoryHandler handler,
            CancellationToken cancellationToken) =>
        {
            await handler.HandleAsync(categoryId, cancellationToken);

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
