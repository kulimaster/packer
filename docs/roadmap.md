# Roadmap

## v1 – první funkční verze

Rozsah potvrzený 2026-11-16.

| # | Funkce | Poznámka |
|---|---|---|
| 1 | Účty (registrace, přihlášení, odhlášení) | ASP.NET Core Identity, cookie |
| 2 | Výlety – CRUD | title, destination, termín, archivace |
| 3 | Kategorie ve výletu – CRUD | název, ikona, poznámka, volitelně bag |
| 4 | Položky – CRUD, množství, poznámka, badge | essential, carry-on only, fragile, TSA, baterie |
| 5 | Zaškrtávání a progress | per kategorie i celý výlet |
| 6 | Bagy a váhy | příruční/zavazadlový, limit kg, odhad hmotnosti |
| 7 | Šablony | knihovna + import do výletu |

Mimo v1: sdílení výletů, počasí, AI tipy, fotky, realtime, archiv jako samostatná obrazovka.

## Po v1

| Verze | Co |
|---|---|
| v1.1 | Sdílení výletů – `TripMember`, pozvánky, role owner/editor/viewer |
| v1.2 | Archiv výletů jako obrazovka, duplikace výletu |
| v2 | Počasí destinace (Open-Meteo), travel intel, smart weight suggestions |
| v2.1 | Fotky výletů (storage), export do PDF |
| ? | Realtime sync (SignalR), mobilní app (React Native) – jen pokud bude potřeba |

## Technický dluh, který vědomě přijímáme

- Žádná cache – jedna instance, Postgres stačí.
- Žádné background joby.
- Žádná verzovaná API – `/api` bez verze do doby, než bude druhý klient.
