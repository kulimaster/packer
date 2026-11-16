using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Packer.Application.Common;
using Packer.Infrastructure.Persistence;

namespace Packer.Infrastructure;

public static class InfrastructureServiceCollectionExtensions
{
    /// <summary>
    /// Persistence + adaptéry portů. Identity samotné registruje Api – tady je jen
    /// úložiště, aby Infrastructure nevěděla, jak se uživatel přihlašuje.
    /// </summary>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException(
                "Connection string 'Default' is not configured. "
                + "Set it via dotnet user-secrets or the ConnectionStrings__Default environment variable.");

        services.AddDbContext<AppDbContext>(options => options
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention());

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<ICurrentUser, HttpContextCurrentUser>();

        return services;
    }
}
