# Doménový model

Rozsah: **v1**. Zdroj pravdy pro kód – když se to rozejde, oprav tento soubor.

## Přehled

```
User 1 ──── * Trip 1 ──── * Bag
                 │
                 └──── * Category ──── * Item
User 1 ──── * Template ──── * TemplateItem
```

## Entity

### User

| Pole | Typ | Poznámka |
|---|---|---|
| `Id` | `Guid` | |
| `Email` | `string` | unikátní, normalizovaný na lowercase |
| `DisplayName` | `string` | 1–80 znaků |
| `CreatedAt` | `DateTimeOffset` | UTC |

Spravuje ASP.NET Core Identity. Vlastní doménová data o uživateli jsou jen tato.

V kódu je to `ApplicationUser : IdentityUser<Guid>` v `Packer.Infrastructure` – Domain o uživateli
neví, drží jen `OwnerId`. Kdyby se přidal `TripMember`, doména dostane vlastní `UserId` value object
a Identity zůstane implementační detail.

### Trip

| Pole | Typ | Poznámka |
|---|---|---|
| `Id` | `Guid` | |
| `OwnerId` | `Guid` | → `User` |
| `Title` | `string` | 1–120, povinné ("Asia Vacation") |
| `Destination` | `string?` | max 160 ("Tokyo & Kyoto, Japan") |
| `CoverImage` | `string?` | id fotky z registru `covers` (např. `asia-tokyo`), ne URL |
| `StartDate` | `DateOnly?` | |
| `EndDate` | `DateOnly?` | |
| `IsArchived` | `bool` | |
| `CreatedAt`, `UpdatedAt` | `DateTimeOffset` | UTC |

**Invarianty**

- `Title` nesmí být prázdný ani samé mezery.
- Pokud jsou oba datumy vyplněné: `EndDate >= StartDate`.
- Archivovaný výlet nelze editovat (jen odarchivovat).
- `CoverImage` je **klíč**, ne URL. Fotky jsou součástí frontendu (`apps/web/public/covers/`),
  takže se v DB neukládá cesta ani binární data. Neznámý klíč (fotka byla z registru odebrána)
  se zobrazí jako gradient – UI nesmí spadnout.

**Odvozený stav (neukládá se)**

| Stav | Podmínka | Zobrazení |
|---|---|---|
| `NotStarted` | `packed = 0` | "Not started" |
| `InProgress` | `0 < packed < total` | "In progress" |
| `Ready` | `total > 0 && packed = total` | "Ready to go" |
| `Archived` | `IsArchived` | "Archived" |

Proč odvozený: uložený stav by se musel přepočítávat při každé změně položky a dřív nebo později by lhal.

### Bag

| Pole | Typ | Poznámka |
|---|---|---|
| `Id` | `Guid` | |
| `TripId` | `Guid` | |
| `Name` | `string` | 1–80 ("Peak Design 30L") |
| `Kind` | `BagKind` | `CarryOn` \| `Checked` \| `Personal` |
| `AllowanceKg` | `decimal?` | max hmotnost pro tento bag |
| `Position` | `int` | pořadí |

### Category

Balicí sekce v rámci výletu ("Airplane Carry-on", "Electronics & Tech"). Ikonu drží klíč z frontendového
registru ikon, ne obrázek v DB.

| Pole | Typ | Poznámka |
|---|---|---|
| `Id` | `Guid` | |
| `TripId` | `Guid` | |
| `BagId` | `Guid?` | volitelné přiřazení k bagu |
| `Name` | `string` | 1–80 |
| `Icon` | `string` | klíč ikony, např. `plane`, `laptop` |
| `Note` | `string?` | max 200 ("Under-seat daypack") |
| `MaxWeightKg` | `decimal?` | limit kategorie |
| `Position` | `int` | pořadí |

### Item

| Pole | Typ | Poznámka |
|---|---|---|
| `Id` | `Guid` | |
| `CategoryId` | `Guid` | |
| `Title` | `string` | 1–120 |
| `Note` | `string?` | max 300 ("Check validity > 6 months") |
| `Quantity` | `int` | >= 1, default 1 |
| `IsEssential` | `bool` | badge "Essential" |
| `Flags` | `ItemTraits` | bitová maska, viz níže |
| `WeightGrams` | `int?` | hmotnost **jednoho** kusu |
| `IsPacked` | `bool` | |
| `PackedAt` | `DateTimeOffset?` | |
| `Position` | `int` | pořadí v kategorii |

**`ItemTraits`** (bitová maska, v DB `int`)

| Flag | Význam |
|---|---|
| `None = 0` | – |
| `CarryOnOnly = 1` | nesmí do zavazadla ("Carry-on only") |
| `Fragile = 2` | "Fragile" |
| `TsaLiquid = 4` | "&lt;100ml TSA" |
| `Battery = 8` | lithiová baterie, restrikce |

Proč bitová maska a ne tabulka: flagů je málo, nemění se, nikdy se nedotazujeme "všechny položky s flagem X"
napříč všemi výlety. Kdyby se to změnilo, je to jedna migrace.

**Invarianty**

- `Quantity >= 1`.
- `PackedAt` je vyplněné právě tehdy, když `IsPacked = true`.
- Položka patří do kategorie, která patří do výletu vlastněného uživatelem, který ji edituje.

### Template

Znovupoužitelný kit ("Airplane Carry-on", 8 items).

| Pole | Typ | Poznámka |
|---|---|---|
| `Id` | `Guid` | |
| `OwnerId` | `Guid?` | `null` = systémová šablona dostupná všem |
| `Name` | `string` | 1–80 |
| `Description` | `string?` | max 160 |
| `Icon` | `string` | klíč ikony |
| `Accent` | `string` | klíč barvy pro kartu (`mint`, `rose`, `amber`, `violet`) |

### TemplateItem

| Pole | Typ | Poznámka |
|---|---|---|
| `Id` | `Guid` | |
| `TemplateId` | `Guid` | |
| `CategoryName` | `string` | do které kategorie se má po importu zařadit |
| `Title`, `Note`, `Quantity`, `IsEssential`, `Flags`, `WeightGrams`, `Position` | – | stejné jako `Item` |

**Import šablony do výletu**: pro každou `CategoryName` najdi nebo vytvoř `Category` ve výletu,
pak vlož `Item`. Duplicity se neřeší (uživatel může mít dvě "Passport" položky) – případný merge je v2.

## Odvozené hodnoty

Nikdy se neukládají, počítají se dotazem:

| Hodnota | Výpočet |
|---|---|
| `packedCount` / `totalCount` | počet `IsPacked` / všech položek |
| `percent` | `packedCount / totalCount * 100`, zaokrouhleno dolů |
| `estimatedWeightGrams` | `Σ (WeightGrams * Quantity)` přes nepřebalené i přebalené |
| `remainingWeightGrams` | `bag.AllowanceKg * 1000 - estimatedWeightGrams` |

## v1 vs. později

| v1 | Později |
|---|---|
| Účty, každý má své výlety | `TripMember` (owner / editor / viewer) a pozvánky |
| Bagy a limity hmotnosti | tare weight, rozložení vah mezi bagy, smart suggestions |
| Šablony uživatele i systémové | vytvoření šablony z existujícího výletu |
| – | počasí destinace, travel intel, fotky výletů, realtime sync |

**Migrační cesta ke sdílení:** `Trip.OwnerId` zůstává, přidá se tabulka `TripMember`
a oprávnění v `Application` se rozšíří z `trip.OwnerId == userId` na členství v `TripMember`.
Žádná změna existujících dat.
