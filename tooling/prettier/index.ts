import type { Config } from "prettier";

import * as PrettierPluginSh from "prettier-plugin-sh";

export const configuration: Config = {
  overrides: [
    {
      files: ["**/*.sh"],
      options: {
        parser: "sh",
        plugins: [PrettierPluginSh],
        spaceRedirects: false,
      },
    },
  ],
};
