namespace Packer.Application.Trips.SetItemPacked;

/// <summary>Přebalení nebo vrácení položky zpět. Čas doplní handler z <c>IClock</c>.</summary>
public sealed record SetItemPackedRequest(bool IsPacked);
