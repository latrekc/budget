# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev          # Start Next.js dev server (localhost:3000)
pnpm run build        # Production build
pnpm run lint         # TypeScript check (tsc --noemit) + ESLint

# Schema pipeline — run in order after changing schema.prisma or GraphQL types:
npx prisma generate   # Regenerate Prisma client
pnpm run schema       # Export GraphQL schema to app/graphql/schema.graphql
pnpm run relay        # Run relay-compiler + lint

# Data scripts
pnpm run import -- <subcommand> <file>   # Import bank transactions (monzo, revolut, hsbc, barclays, wise, tinkoff, sberbank)
pnpm run currencies -- import-year <year>       # Import exchange rates from CSV
pnpm run currencies -- convert-transactions     # Recalculate amount_converted for non-GBP transactions
```

## Architecture

Personal budget tracker: Next.js 14 (App Router) + GraphQL API + SQLite.

**Data flow:** SQLite → Prisma ORM → Pothos GraphQL schema → GraphQL Yoga endpoint (`/graphql`) → Relay on the client.

**Database** lives in a separate git repo (`../budget-database/database.sqlite`), symlinked into this project. It includes SQL views for statistics (per-month, per-source, per-category) defined directly in SQLite, mapped to Prisma via `view` declarations in `schema.prisma`.

**GraphQL layer** (`app/graphql/`):

- `builder.ts` — Pothos SchemaBuilder configured with Prisma, Relay, Errors, and SimpleObjects plugins. Adds a `Date` scalar.
- `types/` — Query/mutation definitions per domain: `transaction.ts`, `category.ts`, `currency.ts`, `statistic.ts`. Each file registers Pothos objects and fields on the shared builder.
- `schema.ts` — Imports all type files and calls `builder.toSchema()`.
- `route.ts` — Next.js App Router route handler exposing the Yoga GraphQL endpoint.

**Client** (`app/components/`):

- Uses Relay for data fetching with `__generated__/` fragments. `relay-compiler` must be run after GraphQL schema changes.
- NextUI component library + Tailwind CSS for styling.
- ECharts for dashboard visualizations.
- `FiltersProvider` (React Context + useReducer) manages shared filter state across Transactions, Categories, and Dashboard pages.
- `usePubSub` provides a simple pub/sub mechanism to coordinate UI updates after mutations.

**Import scripts** (`app/scripts/import/`): CLI parsers for bank export formats (CSV, OFX, JSON). Each parser registers a Commander subcommand. All amounts are stored as integers (pennies). Non-GBP transactions get `amount_converted` calculated using exchange rates from the `currency_exchange_rates` table.

**Key conventions:**

- Path alias: `@/*` maps to `app/*`
- Default currency is GBP; all `amount_converted` values are in GBP pennies
- Categories are hierarchical (up to 3 levels via self-referencing `parentCategoryId`)
- ESLint enforces `strictCamelCase` for variables, `PascalCase` for components/enums
- Prettier with plugins: organize-imports, tailwindcss, prisma, sql
- Package manager: pnpm (enforced via `preinstall` script)
