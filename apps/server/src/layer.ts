import { Authentication } from "@ankaa/authentication";
import { Database } from "@ankaa/database";
import * as Layer from "effect/Layer";

export const applicationLayer = Layer.mergeAll(
  Authentication.layer,
  Database.layer,
);
