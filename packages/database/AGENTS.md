# Database

## Schema

New tables follow the conventions listed below, so you never have to make assumptions or arbitrary choices when you add one.

- Tables are defined in `src/schema/` by following the official PostgreSQL documentation and by avoiding common pitfalls documented in this PostgreSQL wiki page: https://wiki.postgresql.org/wiki/Don't_Do_This. The Drizzle ORM documentation is the reference for syntax only.
- Tables are defined the same way as the other hand-written tables, so the schema reads the same throughout. For example, every table has a singular name, `snake_case` column and index names, and `camelCase` column keys.
- Authentication tables in `src/schema/authentication.ts` were generated automatically through the Better Auth CLI and don't follow these conventions, so never take them as a reference.
