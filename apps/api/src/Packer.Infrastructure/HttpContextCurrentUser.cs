using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Packer.Application.Common;
using Packer.Application.Common.Exceptions;

namespace Packer.Infrastructure;

/// <summary>
/// Bere uživatele z cookie principalu. Neplatné nebo chybějící ID je
/// <see cref="UnauthenticatedException"/> – Api z ní udělá 401, ne 500.
/// </summary>
internal sealed class HttpContextCurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    public Guid UserId
    {
        get
        {
            var subject = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(subject, out var userId)
                ? userId
                : throw new UnauthenticatedException();
        }
    }
}
