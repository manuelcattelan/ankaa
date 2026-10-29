import { defineConfig } from "eslint/config";
import globals from "globals";

import {
  baseConfiguration,
  createFeatureIsolationZone,
  FEATURES_PATH,
  getFeatureNames,
  JAVASCRIPT_FILES,
  vitestConfiguration,
} from "#/base.ts";

type CreatePackageConfigurationOptions = {
  basePath: string;
};

const REPOSITORY_MESSAGE =
  "Import a Repository only in its own Feature's Application Service, so every read and write of the Feature goes through its business operations.";

export function createPackageConfiguration({
  basePath,
}: CreatePackageConfigurationOptions) {
  const featureZones = getFeatureNames(basePath).flatMap((featureName) => {
    const featurePath = `${FEATURES_PATH}/${featureName}`;

    return [
      createFeatureIsolationZone({ featureName, target: featurePath }),
      {
        from: `${featurePath}/${featureName}-repository.ts`,
        message: REPOSITORY_MESSAGE,
        target: `./**/!(${featureName}-application-service.ts)`,
      },
    ];
  });

  return defineConfig([
    baseConfiguration,
    vitestConfiguration,
    {
      files: JAVASCRIPT_FILES,
      languageOptions: { globals: globals.node },
      rules:
        featureZones.length > 0
          ? {
              "import-x/no-restricted-paths": [
                "error",
                { basePath, zones: featureZones },
              ],
            }
          : {},
    },
  ]);
}
