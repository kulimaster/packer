using Packer.Application.Common;

namespace Packer.Infrastructure;

/// <summary>Jediné místo v aplikaci, kde se čte skutečný čas.</summary>
internal sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
