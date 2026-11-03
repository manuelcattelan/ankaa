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

  it("returns only the slug and the owner without APP_VARIANT", () => {
    expect(appConfig()).toStrictEqual({ owner: "ankaa-mobile", slug: "ankaa" });
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

  it("fails with APP_VARIANT set to neither variant", () => {
    Object.assign(process.env, SETTINGS, { APP_VARIANT: "staging" });

    expect(() => appConfig()).toThrow(/^APP_VARIANT: /u);
  });
});
