# ResPOS

Kassa- en beheersysteem voor restaurants: tafels &amp; bar, voorraad (incl. wijn), personeelsrollen, leveranciersbestellingen, dagafsluiting, Spotify-integratie en een QR-menu waarmee gasten aan tafel kunnen bestellen.

Zie [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) voor de volledige architectuur, database-opzet, rollenmodel en fasering.

## Structuur

```
ResPOS/
├── apps/
│   ├── admin-app/       # Beheer/kassa-interface (personeel)
│   └── customer-app/    # QR-menu voor gasten aan tafel
├── backend/             # API: auth, orders, inventory, suppliers, reports, printing, spotify, tables
├── packages/
│   └── shared-types/    # Gedeelde TypeScript types
└── docs/
    └── PROJECT_PLAN.md
```

## Vereisten

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Microsoft SQL Server Express 2019/2022 (lokaal op Windows)

## Snel starten

```bash
# 1. Dependencies installeren (root + alle workspaces)
pnpm install

# 2. Backend env instellen
cp backend/.env.example backend/.env
# vul DATABASE_URL, JWT_SECRET, SPOTIFY_CLIENT_ID/SECRET in

# 3. Database opzetten
pnpm --filter backend prisma:migrate

# 4. Alles starten (backend + admin-app + customer-app)
pnpm dev
```

- Backend draait op `http://localhost:3001`
- Admin-app (kassa/beheer) op `http://localhost:5173`
- Customer-app (QR-menu) op `http://localhost:5174`

## Ontwikkelfasering

Zie sectie 9 van `docs/PROJECT_PLAN.md`. Kort:

1. **Fase 1** — kern-kassa: auth/rollen, tafels &amp; bar, basisvoorraad, dagafsluiting
2. **Fase 2** — klant-QR-flow: menu, bestellen, realtime naar keuken, bonprinten
3. **Fase 3** — voorraad &amp; leveranciers: rapportage, wijnvoorraad, bestellingen
4. **Fase 4** — Spotify-integratie, verfijnde rollen, dashboards

## Branch- en workflow-afspraken (voorstel)

- `main` — altijd deploybaar
- `develop` — actieve ontwikkeling, feature branches takken hier vanaf
- Feature branches: `feature/<korte-naam>`, bugfixes: `fix/<korte-naam>`
- Pull request verplicht richting `develop`, minstens 1 review
