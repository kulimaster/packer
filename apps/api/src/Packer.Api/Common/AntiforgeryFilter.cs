using Microsoft.AspNetCore.Antiforgery;

namespace Packer.Api.Common;

/// <summary>
/// CSRF ochrana mutací: klient musí poslat token z <c>GET /api/auth/csrf</c>
/// v hlavičce <c>X-CSRF-TOKEN</c>. Cookie sama o sobě na mutaci nestačí.
/// </summary>
internal sealed class AntiforgeryFilter(IAntiforgery antiforgery) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        try
        {
            await antiforgery.ValidateRequestAsync(context.HttpContext);
        }
        catch (AntiforgeryValidationException)
        {
            return Results.Json(
                new ApiError("csrf_invalid", "Antiforgery token is missing or invalid."),
                statusCode: StatusCodes.Status400BadRequest);
        }

        return await next(context);
    }
}
