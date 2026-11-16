using Packer.Domain.Common;

namespace Packer.Domain.Tests;

internal static class DomainErrors
{
    /// <summary>Spustí akci a vrátí <see cref="DomainException.Code"/>; kdyby nic nevyhodila, test spadne.</summary>
    public static string CodeOf(Action action) => Assert.Throws<DomainException>(action).Code;
}
