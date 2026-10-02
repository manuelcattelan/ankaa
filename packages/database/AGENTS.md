# Database

## Schema

New tables follow the conventions listed below, so you never have to make assumptions or arbitrary choices when you add one.

- Tables are defined in `src/schema/` by following the official PostgreSQL documentation and by avoiding common pitfalls documented in this PostgreSQL wiki page: https://wiki.postgresql.org/wiki/Don't_Do_This. The Drizzle ORM documentation is the reference for syntax only.
- Tables are defined the same way as the other hand-written tables, so the schema reads the same throughout. For example, every table has a singular name, `snake_case` column and index names, and `camelCase` column keys.
- Authentication tables in `src/schema/authentication.ts` were generated automatically through the Better Auth CLI and don't follow these conventions, so never take them as a reference.

## Migrations

A schema change reaches a database only through a migration. Drizzle Kit generates the migrations in `drizzle/` from the definitions in `src/schema/`, so every change to `src/schema/` needs one. After each change:

1. Generate a migration with a `snake_case` name that sums up its changes, so that the migrations in `drizzle/` read as a history of the schema:

   ```sh
   pnpm --filter @ankaa/database generate <name>
   ```

2. Apply it to the development database, which `DATABASE_URL` in `.env` points to:

   ```sh
   pnpm --filter @ankaa/database migrate
   ```

   Never run `migrate` with a `DATABASE_URL` from anywhere else, such as one set in your shell, unless the user explicitly asks, because only the user decides when any other database changes.

- Never use `drizzle-kit push`, because it changes the database without writing a migration file, so no other database, such as production, can apply the same change.
- Never edit an existing migration, because a database that already ran it never runs it again. To amend or undo a change, generate a new migration.
- When Drizzle Kit asks a question, such as whether a column was renamed or a table was dropped, stop the command and ask the user to run it, because its prompts need an interactive terminal.
