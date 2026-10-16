import { defineConfig } from "eslint/config";
import globals from "globals";

import {
  baseConfiguration,
  createFeatureIsolationZone,
  FEATURES_PATH,
  getFeatureNames,
  JAVASCRIPT_FILES,
} from "./base.ts";

const DATABASE_QUERY_MESSAGE =
  "Import a database query only in an interactor of its own feature.";

const featureNames = getFeatureNames();

const featureInteractorsPaths = featureNames.map(
  (featureName) => `./${featureName}/interactors`,
);

const featureZones = featureNames.flatMap((featureName) => {
  const featurePath = `${FEATURES_PATH}/${featureName}`;
  const featureFilesOutsideInteractors = [
    `${featurePath}/*`,
    `${featurePath}/!(interactors)/**`,
  ];

  return [
    createFeatureIsolationZone({
      featureName,
      target: featureFilesOutsideInteractors,
    }),
    createFeatureIsolationZone({
      allowedFeaturePaths: featureInteractorsPaths,
      featureName,
      target: `${featurePath}/interactors`,
    }),
    {
      from: `${featurePath}/queries`,
      message: DATABASE_QUERY_MESSAGE,
      target: featureFilesOutsideInteractors,
    },
  ];
});

export const packageConfiguration = defineConfig([
  baseConfiguration,
  {
    files: JAVASCRIPT_FILES,
    languageOptions: { globals: globals.node },
    rules: {
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            ...featureZones,
            {
              from: `${FEATURES_PATH}/*/queries/**`,
              message: DATABASE_QUERY_MESSAGE,
              target: ["./src/*", "./src/!(features)/**"],
            },
          ],
        },
      ],
    },
  },
]);
