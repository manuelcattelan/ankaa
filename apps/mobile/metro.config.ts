import { getDefaultConfig } from "expo/metro-config";
import { fileURLToPath } from "node:url";

const defaultConfig = getDefaultConfig(import.meta.dirname);

// react-native-svg-transformer turns each .svg file into a react-native-svg
// component, so Metro reads .svg as source instead of as an asset
// (https://github.com/kristerkari/react-native-svg-transformer#for-react-native-v057-or-newer--expo-sdk-v3100-or-newer).
// Expo merges each section of this config over its defaults
// (https://docs.expo.dev/guides/customizing-metro/), so only the changed keys
// are listed.
export default {
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter(
      (assetExt) => assetExt !== "svg",
    ),
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
  },
  transformer: {
    babelTransformerPath: fileURLToPath(
      import.meta.resolve("react-native-svg-transformer/expo"),
    ),
  },
};
