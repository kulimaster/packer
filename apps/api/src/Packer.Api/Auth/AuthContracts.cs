namespace Packer.Api.Auth;

/// <summary>Token pro hlavičku <c>X-CSRF-TOKEN</c>. Cookie s ním nastaví server sám.</summary>
public sealed record CsrfTokenResponse(string Token);

public sealed record RegisterRequest(string? Email, string? DisplayName, string? Password);

public sealed record LoginRequest(string? Email, string? Password);

/// <summary>Úprava profilu – e-mail se zatím měnit nedá, ten patří do potvrzovacího flow.</summary>
public sealed record UpdateProfileRequest(string? DisplayName);

/// <summary>Změna hesla. Současné heslo je potřeba – chrání před únosem otevřené session.</summary>
public sealed record ChangePasswordRequest(string? CurrentPassword, string? NewPassword);

public sealed record UserResponse(Guid Id, string Email, string DisplayName);
