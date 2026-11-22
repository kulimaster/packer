using Packer.Api.Common;
using Packer.Application.Templates.CreateTemplate;
using Packer.Application.Templates.DeleteTemplate;
using Packer.Application.Templates.GetTemplate;
using Packer.Application.Templates.GetTemplates;
using Packer.Application.Templates.UpdateTemplate;
using Packer.Application.Trips.ImportTemplates;

namespace Packer.Api.Templates;

internal static class TemplateEndpoints
{
    public static IEndpointRouteBuilder MapTemplateEndpoints(this IEndpointRouteBuilder app)
    {
        var templates = app.MapGroup("/templates")
            .RequireAuthorization();

        templates.MapGet("/", async (
            GetTemplatesHandler handler,
            CancellationToken cancellationToken) =>
        {
            var list = await handler.HandleAsync(cancellationToken);

            return Results.Ok(list);
        })
            .Produces<IReadOnlyList<TemplateSummary>>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized);

        templates.MapGet("/{templateId:guid}", async (
            Guid templateId,
            GetTemplateHandler handler,
            CancellationToken cancellationToken) =>
        {
            var template = await handler.HandleAsync(templateId, cancellationToken);

            return Results.Ok(template);
        })
            .Produces<TemplateDetails>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound);

        templates.MapPost("/", async (
            CreateTemplateRequest request,
            CreateTemplateHandler handler,
            CancellationToken cancellationToken) =>
        {
            var template = await handler.HandleAsync(request, cancellationToken);

            return Results.Created($"/api/templates/{template.Id}", template);
        })
            .Produces<TemplateSummary>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .AddEndpointFilter<AntiforgeryFilter>();

        templates.MapPut("/{templateId:guid}", async (
            Guid templateId,
            UpdateTemplateRequest request,
            UpdateTemplateHandler handler,
            CancellationToken cancellationToken) =>
        {
            var template = await handler.HandleAsync(templateId, request, cancellationToken);

            return Results.Ok(template);
        })
            .Produces<TemplateSummary>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .AddEndpointFilter<AntiforgeryFilter>();

        templates.MapDelete("/{templateId:guid}", async (
            Guid templateId,
            DeleteTemplateHandler handler,
            CancellationToken cancellationToken) =>
        {
            await handler.HandleAsync(templateId, cancellationToken);

            return Results.NoContent();
        })
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .AddEndpointFilter<AntiforgeryFilter>();

        var imports = app.MapGroup("/trips/{tripId:guid}/templates")
            .RequireAuthorization();

        imports.MapPost("/", async (
            Guid tripId,
            ImportTemplatesRequest request,
            ImportTemplatesHandler handler,
            CancellationToken cancellationToken) =>
        {
            var result = await handler.HandleAsync(tripId, request, cancellationToken);

            return Results.Ok(result);
        })
            .Produces<ImportTemplatesResult>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict)
            .AddEndpointFilter<AntiforgeryFilter>();

        return app;
    }
}
