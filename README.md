# Budget

## Configuration

Both values are required and have **no default** — the app fails fast if they are unset.
Copy `.env.example` to `.env` (or export them in your shell) and set:

- `DATABASE_FILE` — `file:` URL to the SQLite database (e.g. `file:./database.sqlite`).
- `PORT` — port the Next.js server listens on (e.g. `3000`).

```
cp .env.example .env
```

## Install

```
npx prisma generate
pnpm run schema
pnpm run relay
```
