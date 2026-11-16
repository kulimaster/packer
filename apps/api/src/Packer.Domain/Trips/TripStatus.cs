namespace Packer.Domain.Trips;

/// <summary>
/// Stav výletu. Nikdy se neukládá – počítá se z položek, aby nemohl "lhat"
/// (viz docs/domain-model.md, sekce Odvozený stav).
/// </summary>
public enum TripStatus
{
    NotStarted = 0,
    InProgress = 1,
    Ready = 2,
    Archived = 3,
}

public static class TripStatusRules
{
    /// <summary>
    /// Archivace má přednost: archivovaný výlet je "Archived" i když je vše přebalené.
    /// Prázdný výlet (<paramref name="totalCount"/> = 0) není "Ready" – není co balit.
    /// </summary>
    public static TripStatus Determine(bool isArchived, int packedCount, int totalCount)
    {
        if (isArchived)
        {
            return TripStatus.Archived;
        }

        if (totalCount <= 0 || packedCount <= 0)
        {
            return TripStatus.NotStarted;
        }

        return packedCount >= totalCount
            ? TripStatus.Ready
            : TripStatus.InProgress;
    }
}
