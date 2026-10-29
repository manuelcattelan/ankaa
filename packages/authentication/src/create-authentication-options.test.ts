import type { BetterAuthDBSchema } from "better-auth/db";
import type { PgColumn } from "drizzle-orm/pg-core";

import * as AuthenticationDatabaseSchema from "@ankaa/database/schema/authentication";
import { getAuthTables } from "better-auth/db";
import { getColumns, is } from "drizzle-orm";
import { getTableConfig, IndexedColumn, PgTable } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { createAuthenticationOptions } from "./create-authentication-options.ts";

const COLUMN_DATA_TYPES: Record<string, string> = {
  boolean: "boolean",
  date: "object date",
  number: "number",
  string: "string",
};

const DEFAULT_ON_DELETE = "cascade";

const authenticationTables: Record<string, unknown> =
  AuthenticationDatabaseSchema;

const models = getAuthTables(
  createAuthenticationOptions({
    appleAppBundleIdentifier: "apple-app-bundle-identifier",
    baseUrl: "http://localhost:3000",
    database: {},
    googleIosClientId: "google-ios-client-id",
    googleWebClientId: "google-web-client-id",
    nodeEnvironment: "test",
    secret: "better-auth-secret-placeholder-of-32-characters",
    sendVerificationOtpCode: () => Promise.resolve(),
  }),
);

function getAuthenticationTable(modelName: string) {
  const table = authenticationTables[modelName];

  return is(table, PgTable) ? table : undefined;
}

function listTableMismatches(model: BetterAuthDBSchema[string]) {
  const table = getAuthenticationTable(model.modelName);

  if (table === undefined) {
    return [`${model.modelName}: no table`];
  }

  const columns: Record<string, PgColumn | undefined> = getColumns(table);
  const tableConfig = getTableConfig(table);
  const fields = Object.values(model.fields);
  const mismatches: string[] = [];

  const primaryKeyColumnNames = [
    ...tableConfig.columns.filter((column) => column.primary),
    ...tableConfig.primaryKeys.flatMap((primaryKey) => primaryKey.columns),
  ].map((column) => column.name);

  if (
    primaryKeyColumnNames.length !== 1 ||
    primaryKeyColumnNames[0] !== columns.id?.name
  ) {
    mismatches.push(`${model.modelName}.id: not the only primary key column`);
  }

  for (const columnKey of Object.keys(columns)) {
    if (
      columnKey !== "id" &&
      !fields.some((field) => field.fieldName === columnKey)
    ) {
      mismatches.push(`${model.modelName}.${columnKey}: no field`);
    }
  }

  for (const [fieldKey, field] of Object.entries(model.fields)) {
    const fieldName = field.fieldName ?? fieldKey;
    const column = columns[fieldName];
    const location = `${model.modelName}.${fieldName}`;

    if (column === undefined) {
      mismatches.push(`${location}: no column`);
      continue;
    }

    const fieldDataType = COLUMN_DATA_TYPES[String(field.type)];
    const columnDataType = String(column.dataType);

    if (
      fieldDataType === undefined ||
      !columnDataType.startsWith(fieldDataType)
    ) {
      mismatches.push(
        `${location}: type ${String(field.type)}, column ${columnDataType}`,
      );
    }

    if ((field.required ?? false) !== column.notNull) {
      mismatches.push(
        `${location}: required ${String(field.required)}, column notNull ${String(column.notNull)}`,
      );
    }

    if ((field.unique ?? false) !== column.isUnique) {
      mismatches.push(
        `${location}: unique ${String(field.unique)}, column unique ${String(column.isUnique)}`,
      );
    }

    if (
      field.index === true &&
      !tableConfig.indexes.some(
        (index) =>
          index.config.columns[0] instanceof IndexedColumn &&
          index.config.columns[0].name === column.name,
      )
    ) {
      mismatches.push(`${location}: no index led by the column`);
    }

    const foreignKey = tableConfig.foreignKeys.find(
      (tableForeignKey) => tableForeignKey.reference().columns[0] === column,
    );

    if (field.references === undefined) {
      if (foreignKey !== undefined) {
        mismatches.push(`${location}: foreign key without a reference`);
      }

      continue;
    }

    const referencedTable = getAuthenticationTable(field.references.model);
    const foreignKeyReference = foreignKey?.reference();

    if (
      foreignKey === undefined ||
      foreignKeyReference === undefined ||
      referencedTable === undefined ||
      foreignKeyReference.foreignTable !== referencedTable ||
      foreignKeyReference.foreignColumns[0] !==
        getColumns(referencedTable)[field.references.field] ||
      foreignKey.onDelete !== (field.references.onDelete ?? DEFAULT_ON_DELETE)
    ) {
      mismatches.push(
        `${location}: no foreign key to ${field.references.model}.${field.references.field} on delete ${field.references.onDelete ?? DEFAULT_ON_DELETE}`,
      );
    }
  }

  return mismatches;
}

describe("createAuthenticationOptions", () => {
  it.for(Object.values(models))(
    "gives the $modelName model a Drizzle table whose columns match its fields",
    (model) => {
      expect(listTableMismatches(model)).toStrictEqual([]);
    },
  );
});
