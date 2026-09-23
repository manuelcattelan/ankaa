# Database

## Schema

Hand-written tables look exactly like the generated ones, so the whole schema reads the same.

- Follow the tables in `src/schema/authentication.ts` for every new table: a singular table name, `snake_case` column names with `camelCase` keys, and index names such as `session_userId_idx`.
- Copy only the table, column and index names from generated files. Every other name follows the rules in the root `AGENTS.md`.
