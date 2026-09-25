# ResPOS — Project Architectuur & Startplan

Repo: https://github.com/RandolphWillems/ResPOS

Dit document geeft je een concrete basis om het project op te starten in VS Code: technische keuzes, architectuur, database-opzet, rollenmodel, mappenstructuur en een gefaseerd ontwikkelplan. Het is bewust een *startpunt* — pas het aan waar nodig.

---

## 1. Overzicht van de app

ResPOS bestaat uit drie logische delen die met elkaar communiceren via één backend/API:

1. **Beheer/kassa-omgeving** (personeel) — hoofdscherm met kassa, tafels/bar, voorraad, instellingen, rapportages, leveranciers.
2. **Klant-omgeving** (QR-menu) — publieke, lichte webpagina per tafel waar gasten bestellen.
3. **Backend/API** — centrale logica: bestellingen, voorraad, gebruikers/rollen, printopdrachten, Spotify-koppeling.

Alle drie praten met dezelfde database en realtime-laag, zodat een bestelling die een gast plaatst direct in de keuken en op het kassascherm verschijnt.

---

## 2. Aanbevolen techstack

| Onderdeel | Aanbeveling | Waarom |
|---|---|---|
| Frontend (kassa) | React + TypeScript + Vite | Snel, goede tooling in VS Code, grote community |
| Frontend (klant-menu) | Zelfde React-app, apart "public" route, of losse lichte app | Moet snel laden op telefoons |
| Styling | Tailwind CSS | Snel schermen bouwen, consistent |
| Backend | Node.js + Express of NestJS (TypeScript) | Eén taal front-to-back, makkelijk te onderhouden |
| Database | Microsoft SQL Server Express | Sterk voor lokale Windows-setup, relationele data, transacties voor voorraad en dagafsluiting |
| Realtime (bestelling → keuken/kassa) | WebSockets (Socket.IO) of Supabase Realtime | Nodig voor live keukenbonnen en tafelstatus |
| Authenticatie | JWT + refresh tokens, eigen users-tabel | Rollen/rechten zelf beheren |
| QR-codes | `qrcode` npm-package, gegenereerd per tafel | Eén QR-code per tafel-ID, geen externe dienst nodig |
| Bonprinter | ESC/POS via node-thermal-printer (netwerk/USB-printer) | Standaard voor keukenprinters |
| Spotify | Spotify Web API + Web Playback SDK (OAuth) | Playlist tonen, zoeken, toevoegen, afspelen in browser |
| Hosting later | Backend op bv. Railway/Render, DB op zelfde platform of Supabase | Eenvoudig te starten, kan later naar eigen server |

Je kan dit 1-op-1 gebruiken, of onderdelen vervangen (bv. Supabase in plaats van eigen Postgres+Auth als je sneller wil starten).

---

## 3. Architectuur — modules

```
┌─────────────────────────────┐        ┌──────────────────────────┐
│   Beheer-app (personeel)    │        │   Klant-app (QR-menu)     │
│  - Kassa/hoofdscherm        │        │  - Menu tonen             │
│  - Tafels & bar             │        │  - Bestellen              │
│  - Voorraadbeheer           │        │  - Tafel-sessie           │
│  - Rapporten & dagafsluiting│        │                            │
│  - Instellingen/rollen      │        └──────────────┬────────────┘
│  - Leveranciers-bestellingen│                       │
│  - Spotify-player           │                       │
└──────────────┬──────────────┘                       │
               │           REST + WebSocket API        │
               └───────────────┬───────────────────────┘
                                │
                    ┌───────────────────────┐
                    │       Backend          │
                    │  - Auth & rollen       │
                    │  - Orders-service      │
                    │  - Voorraad-service    │
                    │  - Rapportage-service  │
                    │  - Print-service       │
                    │  - Spotify-proxy       │
                    └───────────┬────────────┘
                                │
                    ┌───────────────────────┐
                    │  SQL Server Express DB  │
                    └───────────────────────┘
```

---

## 4. Database — hoofdentiteiten (vereenvoudigd)

- **users** (id, naam, email, wachtwoord_hash, actief)
- **roles** (id, naam) — bv. Eigenaar, Manager, Ober, Bar, Keuken
- **permissions** (id, naam) — bv. `voorraad.bekijken`, `kassa.gebruiken`, `rapporten.genereren`, `leveranciers.bestellen`, `instellingen.beheren`
- **role_permissions** (role_id, permission_id)
- **user_roles** (user_id, role_id)
- **tables** (id, naam/nummer, zone: tafel/bar, status, qr_token)
- **menu_items** (id, naam, categorie, prijs, beschikbaar, voorraad_item_id)
- **inventory_items** (id, naam, categorie [bv. wijn, drank, keuken], eenheid, huidige_voorraad, min_voorraad, kostprijs)
- **wine_stock** (kan losse tabel zijn of `inventory_items` met categorie "wijn" + extra velden: druif, jaar, leverancier)
- **suppliers** (id, naam, contactgegevens)
- **supplier_orders** (id, supplier_id, status, datum, totaal)
- **supplier_order_lines** (order_id, inventory_item_id, aantal, prijs)
- **orders** (id, table_id, status [open/besteld/klaar/afgerekend], totaal, aangemaakt_op)
- **order_lines** (order_id, menu_item_id, aantal, prijs, opmerking)
- **shifts / day_closings** (id, datum, totaal_omzet, totaal_kosten, winst, afgesloten_door)
- **print_jobs** (id, order_id, printer, status)

Dit is een startpunt — de wijn-koppeling kan je simpel houden als een extra categorie in `inventory_items`, of los trekken als je specifieke wijnvelden nodig hebt (jaargang, druif, wijnhuis).

---

## 5. Rollen & rechten-model

Werk met **rollen die permissies bundelen**, niet met losse per-gebruiker rechten:

- **Eigenaar/Admin** — alles, inclusief instellingen en rapporten
- **Manager** — kassa, voorraad, rapporten, leveranciers, geen instellingen/gebruikersbeheer
- **Ober/Bediening** — alleen kassa + tafels
- **Bar** — alleen bar-tafels + eigen voorraad
- **Keuken** — alleen binnenkomende bestellingen (geen kassa nodig)

Praktisch: bij inloggen haalt de frontend de permissies van de gebruiker op en toont/verbergt UI-onderdelen op basis daarvan. De backend controleert de rechten ook server-side bij elke actie (nooit alleen op de frontend vertrouwen).

---

## 6. Schermen — wat elk scherm nodig heeft

### A. Hoofdscherm (kassa)
- Overzicht tafels + bar met status (vrij/besteld/rekening)
- Klik op tafel → bestelling invoeren/bekijken
- Ingebouwde voorraadweergave (koppeling met wijnvoorraad)
- Spotify-widget: huidige playlist, player-controls, zoeken + toevoegen aan wachtrij
- Top-menu: Instellingen, Gebruikers & rollen

### B. Instellingen
- Gebruikers aanmaken/bewerken
- Rollen toewijzen
- Algemene instellingen (restaurantnaam, printer-IP, Spotify-koppeling)

### C. Voorraadbeheer
- Lijst van voorraaditems + huidige aantallen
- Wijnvoorraad-sectie (koppeling met extern wijnprogramma indien van toepassing — via import/API)
- Rapportgeneratie (verbruik per periode, laagste voorraad, waarde voorraad)
- Dagafsluiting: totale omzet, kosten, winst, export/print

### D. Leveranciers
- Leverancierslijst
- Nieuwe bestelling samenstellen per leverancier
- Bestelgeschiedenis/status

### E. Klant-menu (QR)
- Publieke pagina zonder login: `/menu/:qr_token`
- Scan → herkent tafel → toont menu
- Bestelling plaatsen → komt in `orders`/`order_lines`
- Backend stuurt printopdracht naar keukenprinter + update realtime naar kassascherm

---

## 7. Integraties — praktische aanpak

**Spotify:** OAuth-login (eigenaar koppelt eigen account), gebruik Web Playback SDK voor afspelen in de browser en de Web API voor zoeken/playlist-beheer. Dit vraagt een Spotify Developer-app (client ID/secret) die je zelf aanmaakt op developer.spotify.com.

**Keukenprinter:** meeste keukenprinters (Epson, Star) ondersteunen ESC/POS via netwerk. `node-thermal-printer` kan hiermee praten vanaf je backend zodra een bestelling binnenkomt.

**QR-codes:** genereer per tafel één keer een `qr_token`, maak daarmee een URL (`https://jouwdomein.nl/menu/<token>`), en zet die om in een QR-afbeelding (bv. met de `qrcode`-package) die je kan printen/laten laminieren.

**Wijnvoorraad-koppeling:** als het een los extern programma is met eigen export/API, bouw je een kleine sync-service die periodiek of via webhook de voorraad bijwerkt in jouw `inventory_items`-tabel. Als je zelf bepaalt hoe die wijnvoorraad werkt, kan het gewoon een categorie binnen je eigen systeem zijn — dat is eenvoudiger.

---

## 8. Voorgestelde mappenstructuur

```
ResPOS/
├── apps/
│   ├── admin-app/        # React app: kassa, voorraad, instellingen, rapporten
│   └── customer-app/     # React app: QR-menu voor gasten
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── inventory/
│   │   ├── suppliers/
│   │   ├── reports/
│   │   ├── printing/
│   │   ├── spotify/
│   │   └── tables/
│   └── prisma/ (of typeorm) # database schema & migraties
├── packages/
│   └── shared-types/      # gedeelde TypeScript types tussen apps en backend
├── docs/
│   └── ResPOS_Project_Plan.md
└── README.md
```

Een monorepo (bv. met `pnpm workspaces` of `turborepo`) houdt admin-app, customer-app en backend samen zonder dat je 3 losse repo's moet syncen.

---

## 9. Gefaseerd ontwikkelplan

**Fase 1 — Kern-kassa (MVP)**
- Auth + rollen (basaal: admin/personeel)
- Tafels & bar tonen, bestelling invoeren
- Basisvoorraad koppelen aan menu-items
- Dagafsluiting met totale omzet/winst

**Fase 2 — Klant-QR-flow**
- QR-generatie per tafel
- Publiek menu + bestellen
- Realtime doorzetten naar kassa
- Printen van keukenbon

**Fase 3 — Voorraad & leveranciers**
- Uitgebreide voorraadrapportage
- Wijnvoorraad-koppeling
- Leveranciersbestellingen

**Fase 4 — Extra's**
- Spotify-integratie
- Fijnere rollen/rechten
- Statistieken/dashboards

Dit voorkomt dat je alles gelijk moet bouwen — na Fase 1 heb je al een werkend kassasysteem.

---

## 10. Concrete eerste stappen in VS Code

1. Clone je repo: `git clone https://github.com/RandolphWillems/ResPOS.git`
2. Zet de monorepo-structuur op (map 8 hierboven)
3. `pnpm init` / `npm init` in root, voeg workspaces toe
4. Backend: `npm create nestjs` of handmatig Express + TypeScript opzetten, Prisma toevoegen voor de database
5. Definieer het Prisma-schema op basis van sectie 4
6. Admin-app: `npm create vite@latest admin-app -- --template react-ts`, Tailwind toevoegen
7. Eerste endpoint: login + één tafel-overzicht, zodat je snel iets werkends ziet
8. Vanaf daar: Fase 1 stap voor stap afbouwen

---

*Dit document staat ook los als bestand zodat je het in je repo (bv. onder `docs/`) kan zetten als naslagwerk voor jezelf of toekomstige medewerkers.*
