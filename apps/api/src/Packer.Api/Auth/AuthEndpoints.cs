using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Identity;
using Packer.Api.Common;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;
using Packer.Infrastructure.Persistence;

namespace Packer.Api.Auth;

internal static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth");

        // Klient si token vyžádá před první mutací (registrace, login, vytvoření výletu).
        group.MapGet("/csrf", (HttpContext http, IAntiforgery antiforgery) =>
        {
            var tokens = antiforgery.GetAndStoreTokens(http);
            return Results.Ok(new CsrfTokenResponse(tokens.RequestToken!));
        })
            .Produces<CsrfTokenResponse>(StatusCodes.Status200OK);

        group.MapPost("/register", RegisterAsync)
            .Produces<UserResponse>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .AddEndpointFilter<AntiforgeryFilter>();

        group.MapPost("/login", LoginAsync)
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .AddEndpointFilter<AntiforgeryFilter>();

        group.MapPost("/logout", LogoutAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .RequireAuthorization()
            .AddEndpointFilter<AntiforgeryFilter>();

        group.MapGet("/me", GetMeAsync)
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .RequireAuthorization();

        return app;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterRequest request,
        UserManager<ApplicationUser> users,
        SignInManager<ApplicationUser> signIn,
        IClock clock)
    {
        var email = request.Email?.Trim();
        var displayName = request.DisplayName?.Trim();
        var errors = new Dictionary<string, List<string>>();

        if (string.IsNullOrEmpty(email))
        {
            errors["email"] = ["Email is required."];
        }

        if (string.IsNullOrEmpty(displayName))
        {
            errors["displayName"] = ["Display name is required."];
        }
        else if (displayName.Length > ApplicationUser.DisplayNameMaxLength)
        {
            errors["displayName"] = [$"Display name must be at most {ApplicationUser.DisplayNameMaxLength} characters."];
        }

        if (string.IsNullOrEmpty(request.Password))
        {
            errors["password"] = ["Password is required."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationFailedException(ToValidationErrors(errors));
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            DisplayName = displayName!,
            CreatedAt = clock.UtcNow,
        };

        var result = await users.CreateAsync(user, request.Password!);

        if (!result.Succeeded)
        {
            throw new ValidationFailedException(IdentityErrors(result));
        }

        await signIn.SignInAsync(user, isPersistent: false);

        return Results.Created("/api/auth/me", new UserResponse(user.Id, email!, user.DisplayName));
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        SignInManager<ApplicationUser> signIn,
        UserManager<ApplicationUser> users)
    {
        var email = request.Email?.Trim();

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(request.Password))
        {
            throw new ValidationFailedException(ToValidationErrors(new Dictionary<string, List<string>>
            {
                ["form"] = ["Email and password are required."],
            }));
        }

        var result = await signIn.PasswordSignInAsync(
            email,
            request.Password,
            isPersistent: false,
            lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            // Stejná odpověď pro neexistující účet i špatné heslo – nezrazujeme, co existuje.
            return Results.Json(
                new ApiError("invalid_credentials", "Email or password is incorrect."),
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var user = await users.FindByEmailAsync(email)
            ?? throw new UnauthenticatedException();

        return Results.Ok(new UserResponse(user.Id, user.Email ?? email, user.DisplayName));
    }

    private static async Task<IResult> LogoutAsync(SignInManager<ApplicationUser> signIn)
    {
        await signIn.SignOutAsync();
        return Results.NoContent();
    }

    private static async Task<IResult> GetMeAsync(
        ClaimsPrincipal principal,
        UserManager<ApplicationUser> users)
    {
        var user = await users.GetUserAsync(principal)
            ?? throw new UnauthenticatedException();

        return Results.Ok(new UserResponse(user.Id, user.Email ?? string.Empty, user.DisplayName));
    }

    private static Dictionary<string, string[]> ToValidationErrors(
        Dictionary<string, List<string>> errors) =>
        errors.ToDictionary(pair => pair.Key, pair => pair.Value.ToArray());

    /// <summary>
    /// Identity chyby mají kódy (<c>PasswordTooShort</c>, <c>DuplicateEmail</c>…).
    /// Překládáme je na pole formuláře, aby je frontend uměl zobrazit u konkrétního inputu.
    /// </summary>
    private static Dictionary<string, string[]> IdentityErrors(IdentityResult result)
    {
        var errors = new Dictionary<string, List<string>>();

        foreach (var error in result.Errors)
        {
            var field = error.Code switch
            {
                var code when code.StartsWith("Password", StringComparison.Ordinal) => "password",
                var code when code.StartsWith("Duplicate", StringComparison.Ordinal)
                    || code.StartsWith("InvalidEmail", StringComparison.Ordinal)
                    || code.StartsWith("InvalidUserName", StringComparison.Ordinal) => "email",
                _ => "form",
            };

            if (!errors.TryGetValue(field, out var messages))
            {
                messages = [];
                errors[field] = messages;
            }

            messages.Add(error.Description);
        }

        return ToValidationErrors(errors);
    }
}
