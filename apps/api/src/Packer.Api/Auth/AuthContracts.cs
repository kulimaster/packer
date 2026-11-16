namespace Packer.Api.Auth;

/// <summary>Token pro hlavičku <c>X-CSRF-TOKEN</c>. Cookie s ním nastaví server sám.</summary>
public sealed record CsrfTokenResponse(string Token);

public sealed record RegisterRequest(string? Email, string? DisplayName, string? Password);

public sealed record LoginRequest(string? Email, string? Password);

public sealed record UserResponse(Guid Id, string Email, string DisplayName);
