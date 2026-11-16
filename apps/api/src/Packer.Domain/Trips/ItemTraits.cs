namespace Packer.Domain.Trips;

/// <summary>
/// Vlastnosti položky, které ovlivňují balení (restrikce dopravce), ale není jich dost
/// na samostatnou tabulku. Ukládá se jako <c>int</c> (bitová maska).
/// </summary>
[Flags]
public enum ItemTraits
{
    None = 0,
    CarryOnOnly = 1,
    Fragile = 2,
    TsaLiquid = 4,
    Battery = 8,
}
