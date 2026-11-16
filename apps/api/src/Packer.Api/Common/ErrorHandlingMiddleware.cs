using System.Runtime.ExceptionServices;
using Packer.Application.Common.Exceptions;
using Packer.Domain.Common;

namespace Packer.Api.Common;

/// <summary>
/// Překládá výjimky z Application/Domain na HTTP. Mapování je na jednom místě,
/// endpointy díky tomu neobsahují ani jeden <c>try/catch</c>.
/// </summary>
internal sealed partial class ErrorHandlingMiddleware(
    RequestDelegate next,
    ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            if (context.Response.HasStarted)
            {
                // Nedá se už nic zapsat – ať to spadne s původní výjimkou.
                ExceptionDispatchInfo.Capture(exception).Throw();
                throw;
            }

            await WriteAsync(context, exception);
        }
    }

    private async Task WriteAsync(HttpContext context, Exception exception)
    {
        var (status, error) = Map(exception);

        if (status >= StatusCodes.Status500InternalServerError)
        {
            LogUnhandledException(logger, context.Request.Method, context.Request.Path.ToString(), exception);
        }

        context.Response.Clear();
        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(error, context.RequestAborted);
    }

    private static (int Status, ApiError Error) Map(Exception exception) => exception switch
    {
        ValidationFailedException validation => (
            StatusCodes.Status400BadRequest,
            new ApiError(validation.Code, validation.Message, validation.Errors)),

        UnauthenticatedException unauthenticated => (
            StatusCodes.Status401Unauthorized,
            new ApiError(unauthenticated.Code, unauthenticated.Message)),

        NotFoundException notFound => (
            StatusCodes.Status404NotFound,
            new ApiError(notFound.Code, notFound.Message)),

        ConflictException conflict => (
            StatusCodes.Status409Conflict,
            new ApiError(conflict.Code, conflict.Message)),

        // Doménová pravidla jsou chyba vstupu (400), jen archivace je konflikt stavu (409).
        DomainException domain => (
            domain.Code == "trip_archived" ? StatusCodes.Status409Conflict : StatusCodes.Status400BadRequest,
            new ApiError(domain.Code, domain.Message)),

        BadHttpRequestException badRequest => (
            StatusCodes.Status400BadRequest,
            new ApiError("invalid_request", badRequest.Message)),

        _ => (
            StatusCodes.Status500InternalServerError,
            new ApiError("server_error", "An unexpected error occurred.")),
    };

    // CA1848: zdrojově generovaný logger je rychlejší a message template zůstane strukturální.
    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled exception on {Method} {Path}")]
    private static partial void LogUnhandledException(
        ILogger logger,
        string method,
        string path,
        Exception exception);
}

internal static class ErrorHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder app) =>
        app.UseMiddleware<ErrorHandlingMiddleware>();
}
