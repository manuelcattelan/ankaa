# Database

## Tables

Follow the [PostgreSQL docs](https://www.postgresql.org/docs/current/) and the wiki's [Don't Do This](https://wiki.postgresql.org/wiki/Don't_Do_This) for types, constraints and indexes, and Drizzle's docs only for how to write them, because Drizzle's own examples use types that page advises against, such as `serial` and `timestamp` without time zone.

- Name a table in the singular, and its columns and relations by the root's Members rule, so a column drops its table's concept, such as `type` rather than `set_type`. Define a table with `snakeCase.table` and write only the camelCase keys, so Drizzle derives every SQL name.
- Name every index and constraint explicitly, as `<table>_<columns>_<suffix>`, with `_pkey`, `_key`, `_fkey`, `_check` or `_idx`, because Drizzle Kit's defaults differ from PostgreSQL's and PostgreSQL truncates names at 63 bytes. Name it `<table>_<meaning>_<suffix>` only when its columns don't say what it's for, as with a partial index or a check across columns, or when the columns would make the name too long. Rename an index together with the Repository that maps its violation to a Wire error.
- Make every id a UUID v7. Let the mobile app generate it when it refers to the row before a Save or upserts it, so a retried Save stays idempotent, and let PostgreSQL's `uuidv7()` default generate it otherwise.
- Give a table that stores a value set of its parent, such as the days of a Routine, the composite primary key (parent id, value) and no `id` of its own, because the pair already identifies the row and nothing references it.
- Add `created_at` and `updated_at` only to a table whose rows are updated in place. Set `updated_at` with ``$onUpdate(() => sql`now()`)`` in the column definition, and never set it by hand, because Drizzle applies `$onUpdate` to updates and upserts alike.
- Soft-delete with `deleted_at` an aggregate that a User deletes as a whole, keep its children with it, and make every unique index of its table partial on `deleted_at IS NULL`. Account deletion hard-deletes every row the User owns through the `user_id` cascades, because the law requires personal data to be erasable ([GDPR Article 17](https://gdpr-info.eu/art-17-gdpr/)).
- Store a value set as a `text` column with a CHECK built from its `@ankaa/core` constant with `inArray`, never as a PostgreSQL enum, so a change to the constant regenerates the CHECK, and an enum can't drop a value without being recreated.
- Enforce every rule that the Wire Schema checks on a single row with a CHECK built from the same constant, and every uniqueness and foreign key in the database, because the database is the last line of defense. Leave a rule across rows that isn't uniqueness to the Core.
- Use `ON DELETE CASCADE` for a row that an aggregate owns and for every `user_id`, and `ON DELETE RESTRICT` for a reference to another aggregate, as the PostgreSQL docs' [orders and products example](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK) does.
- Make every foreign key column the first column of a non-partial index, because PostgreSQL creates no index for a foreign key.
- Declare every relation in `src/relations.ts`, in its one `defineRelations(schema, (r) => …)`, in both directions and across Features, because Drizzle merges several relation parts with a shallow spread, so a second part that declares the same table silently replaces the first.
- Hold better-auth's tables to these conventions too, since its adapter maps fields by property name. When a better-auth upgrade or plugin needs new fields, generate the schema with the CLI through `better-auth.config.ts` and merge the fields by hand, never overwrite the file.

## Migrations

A schema change reaches a database only through a migration that Drizzle Kit generates in `drizzle/` from `src/schema/`, so every change to `src/schema/` needs one. After each change:

1. Generate a migration with a `snake_case` name that sums up the change, so `drizzle/` reads as the history of the schema: `pnpm --filter @ankaa/database generate <name>`.
2. Apply it to the development database, which `DATABASE_URL_DIRECT` in the root `.env` points to: `pnpm --filter @ankaa/database migrate`. Never run `migrate` with any other `DATABASE_URL_DIRECT`, such as one set in your shell, unless the maintainer asks, because only the maintainer decides when another database changes.

- Never use `drizzle-kit push`, because it changes a database without a migration, so no other database can apply the same change.
- Never edit an existing migration, because a database that already ran it never runs it again. Generate a new migration to amend or undo a change.
- When Drizzle Kit needs to know whether a table or column was renamed, run `generate` with `--explain --output json` to list its questions, then run it again with `--hints` to answer each one, renaming only what the spec renames.
