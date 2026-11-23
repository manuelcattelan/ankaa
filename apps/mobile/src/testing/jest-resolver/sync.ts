type ResolverOptions = {
  basedir: string;
  defaultResolver: (request: string, options: ResolverOptions) => string;
  extensions?: string[] | undefined;
};

/**
 * Jest's resolver for the mobile app, exported as the `sync` function Jest
 * looks for (https://jestjs.io/docs/configuration#resolver-string). It
 * resolves Reanimated's `initializers` to its web file, as Reanimated's own
 * `react-native-reanimated/jest/resolver` does
 * (https://docs.swmansion.com/react-native-reanimated/docs/guides/testing-with-jest),
 * because its iOS file calls `setCSSEventHandler`, which Reanimated's Jest
 * implementation throws on, and the mock that expo-router's testing library
 * installs then exports nothing. Reanimated's resolver can't be used whole:
 * it treats every file whose folder name contains `react-native-worklets` as
 * a file of Worklets, which under pnpm is every file of Reanimated, since its
 * folder name lists its peer dependencies, so it would resolve every web file
 * of Reanimated, and those import react-native-web, which Ankaa doesn't
 * install.
 */
export function sync(request: string, options: ResolverOptions) {
  return options.defaultResolver(
    request,
    request === "./initializers" &&
      options.basedir.includes("/node_modules/react-native-reanimated/")
      ? {
          ...options,
          extensions: options.extensions?.filter(
            (extension) => !extension.includes("native"),
          ),
        }
      : options,
  );
}
