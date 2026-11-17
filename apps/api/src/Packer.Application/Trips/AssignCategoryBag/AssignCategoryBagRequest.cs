namespace Packer.Application.Trips.AssignCategoryBag;

/// <summary>Přiřazení kategorie k bagu. <c>null</c> kategorii z bagu odebere.</summary>
public sealed record AssignCategoryBagRequest(Guid? BagId);
