# Bijdragen aan ResPOS

## Workflow

1. Branch vanaf `develop`: `feature/<korte-naam>` of `fix/<korte-naam>`
2. Commit in het Engels of Nederlands, maar consistent binnen één PR
3. Open een pull request richting `develop`, minstens 1 review nodig
4. CI (`.github/workflows/ci.yml`) moet groen zijn: install, prisma generate, build

## Lokale checks vóór een PR

```bash
pnpm install
pnpm build
pnpm lint
```

## Database-wijzigingen

Pas `backend/prisma/schema.prisma` aan en draai:

```bash
pnpm --filter backend prisma migrate dev --name <beschrijving>
```

Commit de gegenereerde migratie mee in `backend/prisma/migrations/`.

## Mapconventie

Nieuwe backend-functionaliteit krijgt een eigen map onder `backend/src/<domein>/` met een `router.ts`. Zie `src/tables`, `src/orders`, `src/inventory` als voorbeeld.
