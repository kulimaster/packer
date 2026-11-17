using Packer.Api.Common;
using Packer.Application.Trips;
using Packer.Application.Trips.CreateCategory;

namespace Packer.Api.Trips;

internal static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/trips/{tripId:guid}/categories")
            .RequireAuthorization();

        group.MapPost("/", async (
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

        return app;
    }
}
