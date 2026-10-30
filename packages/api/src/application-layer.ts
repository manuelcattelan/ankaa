import { Authentication } from "@ankaa/authentication/authentication";
import * as Layer from "effect/Layer";

import { applicationServicesLayer } from "#/application-services-layer.ts";

export const applicationLayer = Layer.mergeAll(
  Authentication.layer,
  applicationServicesLayer,
);
