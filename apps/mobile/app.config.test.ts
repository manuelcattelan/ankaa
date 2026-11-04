import appConfig from "#/app.config.ts";

const SETTINGS = {
  EXPO_PUBLIC_API_URL: "https://api.ankaa.test",
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "123-abc.apps.googleusercontent.com",
};

describe("appConfig", () => {
  beforeEach(() => {
    delete process.env.APP_VARIANT;
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  });

  it("returns only the slug, the owner and the EAS project id without APP_VARIANT", () => {
    expect(appConfig()).toStrictEqual({
      extra: { eas: { projectId: "4cab2d0d-aa34-4dcf-a7a3-f553e3cd99c2" } },
      owner: "ankaa-mobile",
      slug: "ankaa",
    });
  });

  it("returns the development variant with APP_VARIANT set to development", () => {
    Object.assign(process.env, SETTINGS, { APP_VARIANT: "development" });

    const config = appConfig();

    expect(config).toMatchObject({
      ios: {
        associatedDomains: ["applinks:api.ankaa.test?mode=developer"],
        bundleIdentifier: "app.ankaa.development",
      },
      name: "Ankaa Dev",
      scheme: "ankaa-development",
    });
    expect(config.plugins).toContainEqual([
      "expo-dev-client",
      { addGeneratedScheme: true },
    ]);
  });

  it("returns the production variant with APP_VARIANT set to production", () => {
    Object.assign(process.env, SETTINGS, { APP_VARIANT: "production" });

    const config = appConfig();

    expect(config).toMatchObject({
      ios: {
        associatedDomains: ["applinks:api.ankaa.test"],
        bundleIdentifier: "app.ankaa",
      },
      name: "Ankaa",
      scheme: "ankaa",
    });
    expect(config.plugins).toContainEqual([
      "expo-dev-client",
      { addGeneratedScheme: false },
    ]);
  });

  it("declares no non-exempt encryption with either APP_VARIANT", () => {
    Object.assign(process.env, SETTINGS, { APP_VARIANT: "development" });
    const developmentConfig = appConfig();
    process.env.APP_VARIANT = "production";
    const productionConfig = appConfig();

    expect(developmentConfig).toMatchObject({
      ios: { config: { usesNonExemptEncryption: false } },
    });
    expect(productionConfig).toMatchObject({
      ios: { config: { usesNonExemptEncryption: false } },
    });
  });

  it("names the EAS project with either APP_VARIANT", () => {
    Object.assign(process.env, SETTINGS, { APP_VARIANT: "development" });
    const developmentConfig = appConfig();
    process.env.APP_VARIANT = "production";
    const productionConfig = appConfig();

    expect(developmentConfig).toMatchObject({
      extra: { eas: { projectId: "4cab2d0d-aa34-4dcf-a7a3-f553e3cd99c2" } },
    });
    expect(productionConfig).toMatchObject({
      extra: { eas: { projectId: "4cab2d0d-aa34-4dcf-a7a3-f553e3cd99c2" } },
    });
  });

  it("fails with APP_VARIANT set to neither variant", () => {
    Object.assign(process.env, SETTINGS, { APP_VARIANT: "staging" });

    expect(() => appConfig()).toThrow(/^APP_VARIANT: /u);
  });
});
