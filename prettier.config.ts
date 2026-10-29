import type { Config } from "prettier";

import * as PrettierPluginSh from "prettier-plugin-sh";

const config: Config = {
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

export default config;
