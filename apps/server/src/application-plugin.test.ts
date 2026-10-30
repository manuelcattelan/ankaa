import type { TestRuntime } from "@ankaa/api/shared/testing/create-test-runtime";
import type {
  FakeSocialProviderResponses,
  SocialProviderRequest,
} from "@ankaa/authentication/testing/fake-social-provider-http-client-layer";
import type { SentEmail } from "@ankaa/email/testing/fake-email-layer";
import type { FastifyInstance } from "fastify";

import { ExerciseApplicationService } from "@ankaa/api/features/exercise/exercise-application-service";
import { RoutineApplicationService } from "@ankaa/api/features/routine/routine-application-service";
import { WorkoutApplicationService } from "@ankaa/api/features/workout/workout-application-service";
import { createSignedInCaller } from "@ankaa/api/shared/testing/create-signed-in-caller";
import { createTestRuntime } from "@ankaa/api/shared/testing/create-test-runtime";
import { Authentication } from "@ankaa/authentication/authentication";
import { AuthenticationTestHelpers } from "@ankaa/authentication/testing/authentication-test-helpers";
import { createTestUser } from "@ankaa/authentication/testing/create-test-user";
import { fakeSocialProviderHttpClientLayer } from "@ankaa/authentication/testing/fake-social-provider-http-client-layer";
import { TEST_APPLE_PRIVATE_KEY } from "@ankaa/authentication/testing/test-apple-private-key";
import { AUTHORIZATION_CODE_HEADER_NAME } from "@ankaa/core/features/authentication/constants/authorization-code-header-name";
import { Database } from "@ankaa/database/database";
import { verification } from "@ankaa/database/schema/authentication";
import { exercise } from "@ankaa/database/schema/exercise";
import { fakeEmailLayer } from "@ankaa/email/testing/fake-email-layer";
import { fakeStalledEmailLayer } from "@ankaa/email/testing/fake-stalled-email-layer";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import fastify from "fastify";
import { createPublicKey, verify } from "node:crypto";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { applicationPlugin } from "#/application-plugin.ts";
import { createLoggerLayer } from "#/create-logger-layer.ts";

type SignInResponseBody = {
  user: { id: string };
};

const DELETE_ACCOUNT_LINK_PATTERN =
  /^http:\/\/localhost:3000\/delete-account\?token=[\da-z]{32}$/;

const OTP_CODE_PATTERN = /^\d{6}$/;

const RATE_LIMIT_MAXIMUM_REQUEST_COUNT = 1000;

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000001";

const DELETED_ROUTINE_ID = "019a0000-0000-7000-8000-000000000011";

const DELETED_WORKOUT_ROUTINE_ID = "019a0000-0000-7000-8000-000000000013";

const DELETED_WORKOUT_ID = "019a0000-0000-7000-8000-000000000021";

const KEPT_ROUTINE_ID = "019a0000-0000-7000-8000-000000000012";

const REQUEST_ID = "request-1";

const HTTP_STATUS_BAD_REQUEST = 400;

const SOCIAL_PROVIDER_RESPONSES = {
  "https://appleid.apple.com/auth/revoke": () => new Response(null),
  "https://appleid.apple.com/auth/token": () =>
    Response.json({
      ["access_token"]: "apple-access-token",
      ["expires_in"]: 3600,
      ["id_token"]: "apple-id-token",
      ["refresh_token"]: "apple-refresh-token",
      ["token_type"]: "Bearer",
    }),
  "https://oauth2.googleapis.com/revoke": () => new Response(null),
  "https://oauth2.googleapis.com/token": () =>
    Response.json({
      ["access_token"]: "google-access-token",
      ["expires_in"]: 3599,
      ["id_token"]: "google-id-token",
      ["refresh_token"]: "google-refresh-token",
      scope: "openid email profile",
      ["token_type"]: "Bearer",
    }),
};

const UUID_V7_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/;

const WELL_KNOWN_FILE_SETTINGS = {
  androidAppPackageName: "app.ankaa.test",
  androidAppSha256CertificateFingerprints: [
    "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5",
  ],
  appleAppBundleId: "app.ankaa.test",
  appleTeamId: "ABCDE12345",
};

const session = {
  session: {
    createdAt: new Date("2026-10-29T10:00:00.000Z"),
    expiresAt: new Date("2026-11-05T10:00:00.000Z"),
    id: "session-1",
    token: "session-token-1",
    updatedAt: new Date("2026-10-29T10:00:00.000Z"),
    userId: "user-1",
  },
  user: {
    createdAt: new Date("2026-10-29T10:00:00.000Z"),
    email: "anna@example.com",
    emailVerified: true,
    id: "user-1",
    name: "Anna",
    updatedAt: new Date("2026-10-29T10:00:00.000Z"),
  },
};

/**
 * Builds a server whose Services do only what `authentication` and
 * `exerciseApplicationService` implement, and fail loudly otherwise, and
 * whose log lines at `level` go to `logLines`.
 */
async function createLoggingServer({
  authentication = {},
  exerciseApplicationService = {},
  level,
  logLines,
}: {
  authentication?: Layer.PartialEffectful<Authentication["Service"]>;
  exerciseApplicationService?: Layer.PartialEffectful<
    ExerciseApplicationService["Service"]
  >;
  level: string;
  logLines: unknown[];
}) {
  const layer = Layer.mergeAll(
    Layer.mock(Authentication, authentication),
    Layer.mock(ExerciseApplicationService, exerciseApplicationService),
    Layer.mock(RoutineApplicationService, {}),
    Layer.mock(WorkoutApplicationService, {}),
  );
  const server = fastify({
    genReqId: () => REQUEST_ID,
    logger: {
      level,
      stream: {
        write: (logLine: string) => {
          logLines.push(JSON.parse(logLine));
        },
      },
    },
  });
  const runtime = ManagedRuntime.make(
    layer.pipe(Layer.provideMerge(createLoggerLayer(server.log))),
  );

  server.addHook("onClose", async () => {
    await runtime.dispose();
  });

  await server.register(applicationPlugin, {
    ...WELL_KNOWN_FILE_SETTINGS,
    runtime,
  });

  return server;
}

async function createSocialProviderServer({
  responses,
  sentEmails,
}: {
  responses: FakeSocialProviderResponses;
  sentEmails: SentEmail[];
}) {
  const runtime = createTestRuntime({
    emailLayer: fakeEmailLayer(sentEmails),
    socialProviderHttpClientLayer: fakeSocialProviderHttpClientLayer({
      responses,
    }),
  });
  const server = fastify();

  server.addHook("onClose", async () => {
    await runtime.dispose();
  });

  await server.register(applicationPlugin, {
    ...WELL_KNOWN_FILE_SETTINGS,
    runtime,
  });

  return server;
}

function createUnsignedIdToken(claims: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");

  return `${header}.${payload}.`;
}

function decodeAppleClientSecret(appleClientSecret: string | undefined) {
  const [header = "", payload = "", signature = ""] =
    String(appleClientSecret).split(".");
  const decodedHeader: unknown = JSON.parse(
    Buffer.from(header, "base64url").toString(),
  );
  const decodedPayload: unknown = JSON.parse(
    Buffer.from(payload, "base64url").toString(),
  );

  return {
    header: decodedHeader,
    isSignatureValid: verify(
      "sha256",
      Buffer.from(`${header}.${payload}`),
      {
        dsaEncoding: "ieee-p1363",
        key: createPublicKey(TEST_APPLE_PRIVATE_KEY),
      },
      Buffer.from(signature, "base64url"),
    ),
    payload: decodedPayload,
  };
}

async function deleteAccount({
  cookies,
  sentEmails,
  server,
}: {
  cookies: Record<string, string>;
  sentEmails: SentEmail[];
  server: FastifyInstance;
}) {
  await server.inject({
    cookies,
    method: "POST",
    payload: {},
    url: "/api/auth/delete-user",
  });
  const token = /token=([\da-z]+)/.exec(String(sentEmails.at(-1)?.text))?.[1];

  return server.inject({
    cookies,
    method: "POST",
    payload: { token },
    url: "/api/auth/delete-user",
  });
}

function buildRoutineSaveInput(id: string) {
  return {
    days: ["monday" as const],
    id,
    name: "Push day",
    sections: {
      coolDown: [],
      main: [
        {
          exercises: [
            {
              exerciseId: BENCH_PRESS_EXERCISE_ID,
              id: `${id.slice(0, -3)}301`,
              note: null,
              sets: [],
              warmUpExercises: [],
            },
          ],
          id: `${id.slice(0, -3)}201`,
        },
      ],
      warmUp: [],
    },
  };
}

function listRowsOwnedBy({
  routineId,
  runtime,
  userId,
}: {
  routineId: string;
  runtime: TestRuntime;
  userId: string;
}) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      return {
        routineDays: yield* database.query.routineDay.findMany({
          where: { routineId },
        }),
        routines: yield* database.query.routine.findMany({
          where: { userId },
        }),
        sessions: yield* database.query.session.findMany({
          where: { userId },
        }),
        users: yield* database.query.user.findMany({ where: { id: userId } }),
      };
    }),
  );
}

function listWorkoutsOwnedBy({
  runtime,
  userId,
}: {
  runtime: TestRuntime;
  userId: string;
}) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      return yield* database.query.workout.findMany({ where: { userId } });
    }),
  );
}

function sendOtpCodeRequests({
  count,
  remoteAddress,
  server,
}: {
  count: number;
  remoteAddress: string;
  server: FastifyInstance;
}) {
  return Promise.all(
    Array.from({ length: count }, () =>
      server.inject({
        method: "POST",
        payload: { email: "rate-limited@example.com", type: "sign-in" },
        remoteAddress,
        url: "/api/auth/email-otp/send-verification-otp",
      }),
    ),
  );
}

function sendRequestsUpToRateLimit({
  remoteAddress,
  server,
}: {
  remoteAddress: string;
  server: FastifyInstance;
}) {
  return Promise.all(
    Array.from({ length: RATE_LIMIT_MAXIMUM_REQUEST_COUNT }, () =>
      server.inject({ method: "GET", remoteAddress, url: "/health" }),
    ),
  );
}

describe("applicationPlugin", () => {
  const sentEmails: SentEmail[] = [];
  const socialProviderRequests: SocialProviderRequest[] = [];
  const runtime = createTestRuntime({
    emailLayer: fakeEmailLayer(sentEmails),
    socialProviderHttpClientLayer: fakeSocialProviderHttpClientLayer({
      receivedRequests: socialProviderRequests,
      responses: SOCIAL_PROVIDER_RESPONSES,
    }),
  });
  let server: FastifyInstance;

  beforeAll(async () => {
    await runtime.runPromise(
      Effect.gen(function* () {
        const database = yield* Database;

        yield* database.insert(exercise).values({
          amountUnit: "repetition",
          id: BENCH_PRESS_EXERCISE_ID,
          name: "Bench Press (Barbell)",
          weightType: "total",
        });
      }),
    );
  });

  beforeEach(async () => {
    server = fastify();

    await server.register(applicationPlugin, {
      ...WELL_KNOWN_FILE_SETTINGS,
      runtime,
    });
  });

  afterEach(async () => {
    await server.close();
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("answers /api/auth/get-session with the session of the signed-in User whose session cookie the request carries", async () => {
    const testUser = await createTestUser(runtime);

    const response = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "GET",
      url: "/api/auth/get-session",
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toMatchObject({
      session: { userId: testUser.user.id },
      user: { email: testUser.user.email, id: testUser.user.id },
    });
  });

  it("answers /api/auth/get-session with no session once the User is deleted, even with every cookie an earlier answer set", async () => {
    const testUser = await createTestUser(runtime);
    const earlierResponse = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "GET",
      url: "/api/auth/get-session",
    });
    await runtime.runPromise(
      Effect.gen(function* () {
        const test = yield* AuthenticationTestHelpers;

        yield* Effect.promise(() => test.deleteUser(testUser.user.id));
      }),
    );

    const response = await server.inject({
      headers: {
        cookie: [
          testUser.headers.get("cookie"),
          ...earlierResponse.cookies.map(
            (cookie) => `${cookie.name}=${cookie.value}`,
          ),
        ].join("; "),
      },
      method: "GET",
      url: "/api/auth/get-session",
    });

    expect(response.json()).toBe(null);
  });

  it("ends the session whose cookie /api/auth/sign-out carries, so /api/auth/get-session answers no session with that cookie", async () => {
    const testUser = await createTestUser(runtime);
    await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "POST",
      url: "/api/auth/sign-out",
    });

    const response = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "GET",
      url: "/api/auth/get-session",
    });

    expect(response.json()).toBe(null);
  });

  it("sends the verification code by email when /api/auth/email-otp/send-verification-otp is requested", async () => {
    await server.inject({
      method: "POST",
      payload: { email: "anna@example.com", type: "sign-in" },
      url: "/api/auth/email-otp/send-verification-otp",
    });

    expect(sentEmails).toMatchObject([
      { subject: "Your sign-in verification code", to: "anna@example.com" },
    ]);

    expect(sentEmails[0]?.text).toMatch(OTP_CODE_PATTERN);
  });

  it("stores the verification code it sends hashed", async () => {
    await server.inject({
      method: "POST",
      payload: { email: "hashed-code@example.com", type: "sign-in" },
      remoteAddress: "192.0.2.20",
      url: "/api/auth/email-otp/send-verification-otp",
    });

    const verifications = await runtime.runPromise(
      Effect.gen(function* () {
        const database = yield* Database;

        return yield* database
          .select({ value: verification.value })
          .from(verification);
      }),
    );

    expect(verifications).not.toContainEqual(
      expect.objectContaining<Record<string, unknown>>({
        value: expect.stringContaining(String(sentEmails.at(-1)?.text)),
      }),
    );
  });

  it("answers a verification code request without waiting for the email to be sent", async () => {
    const stalledSentEmails: SentEmail[] = [];
    const stalledEmailRuntime = createTestRuntime({
      emailLayer: fakeStalledEmailLayer(stalledSentEmails),
    });
    const stalledEmailServer = fastify();
    await stalledEmailServer.register(applicationPlugin, {
      ...WELL_KNOWN_FILE_SETTINGS,
      runtime: stalledEmailRuntime,
    });

    const response = await stalledEmailServer.inject({
      method: "POST",
      payload: { email: "stalled-email@example.com", type: "sign-in" },
      remoteAddress: "192.0.2.23",
      url: "/api/auth/email-otp/send-verification-otp",
    });
    await stalledEmailServer.close();
    await stalledEmailRuntime.dispose();

    expect(response.statusCode).toBe(200);
    expect(stalledSentEmails).toMatchObject([
      {
        subject: "Your sign-in verification code",
        to: "stalled-email@example.com",
      },
    ]);
  });

  it("rejects the previous verification code once a new one is sent", async () => {
    const remoteAddress = "192.0.2.21";

    await server.inject({
      method: "POST",
      payload: { email: "resend@example.com", type: "sign-in" },
      remoteAddress,
      url: "/api/auth/email-otp/send-verification-otp",
    });
    const previousOtpCode = sentEmails.at(-1)?.text;
    await server.inject({
      method: "POST",
      payload: { email: "resend@example.com", type: "sign-in" },
      remoteAddress,
      url: "/api/auth/email-otp/send-verification-otp",
    });

    const response = await server.inject({
      method: "POST",
      payload: { email: "resend@example.com", otp: previousOtpCode },
      remoteAddress,
      url: "/api/auth/sign-in/email-otp",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "INVALID_OTP" });
  });

  it("signs the User in with the latest verification code sent", async () => {
    const remoteAddress = "192.0.2.22";

    await server.inject({
      method: "POST",
      payload: { email: "latest-code@example.com", type: "sign-in" },
      remoteAddress,
      url: "/api/auth/email-otp/send-verification-otp",
    });
    await server.inject({
      method: "POST",
      payload: { email: "latest-code@example.com", type: "sign-in" },
      remoteAddress,
      url: "/api/auth/email-otp/send-verification-otp",
    });

    const response = await server.inject({
      method: "POST",
      payload: {
        email: "latest-code@example.com",
        otp: sentEmails.at(-1)?.text,
      },
      remoteAddress,
      url: "/api/auth/sign-in/email-otp",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: { email: "latest-code@example.com" },
    });
  });

  it("creates a User with a UUID v7 id when /api/auth/sign-in/email-otp is requested with the verification code sent to a new email address", async () => {
    await server.inject({
      method: "POST",
      payload: { email: "new-user@example.com", type: "sign-in" },
      url: "/api/auth/email-otp/send-verification-otp",
    });

    const response = await server.inject({
      method: "POST",
      payload: { email: "new-user@example.com", otp: sentEmails.at(-1)?.text },
      url: "/api/auth/sign-in/email-otp",
    });

    expect(response.statusCode).toBe(200);

    expect(response.json<SignInResponseBody>().user.id).toMatch(
      UUID_V7_PATTERN,
    );
  });

  it("signs a new User in with an Apple id token when /api/auth/sign-in/social is requested", async () => {
    const response = await server.inject({
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "apple-user@example.com",
            email_verified: true,
            sub: "apple-user-1",
          }),
        },
        provider: "apple",
      },
      remoteAddress: "192.0.2.30",
      url: "/api/auth/sign-in/social",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: { email: "apple-user@example.com" },
    });
  });

  it("answers /api/auth/get-session with the session that an id-token sign-in's cookie carries", async () => {
    const signInResponse = await server.inject({
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "apple-session@example.com",
            email_verified: true,
            sub: "apple-user-2",
          }),
        },
        provider: "apple",
      },
      remoteAddress: "192.0.2.34",
      url: "/api/auth/sign-in/social",
    });

    const response = await server.inject({
      cookies: Object.fromEntries(
        signInResponse.cookies.map((cookie) => [cookie.name, cookie.value]),
      ),
      method: "GET",
      url: "/api/auth/get-session",
    });

    expect(response.json()).toMatchObject({
      user: { email: "apple-session@example.com" },
    });
  });

  it("signs a new User in with a Google id token when /api/auth/sign-in/social is requested", async () => {
    const response = await server.inject({
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "google-user@example.com",
            email_verified: true,
            sub: "google-user-1",
          }),
        },
        provider: "google",
      },
      remoteAddress: "192.0.2.31",
      url: "/api/auth/sign-in/social",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: { email: "google-user@example.com" },
    });
  });

  it("signs in with a Google id token the User who already signed in with a verification code sent to the same verified email address", async () => {
    const remoteAddress = "192.0.2.32";
    await server.inject({
      method: "POST",
      payload: { email: "linked@example.com", type: "sign-in" },
      remoteAddress,
      url: "/api/auth/email-otp/send-verification-otp",
    });
    const otpCodeSignInResponse = await server.inject({
      method: "POST",
      payload: { email: "linked@example.com", otp: sentEmails.at(-1)?.text },
      remoteAddress,
      url: "/api/auth/sign-in/email-otp",
    });

    const response = await server.inject({
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "linked@example.com",
            email_verified: true,
            sub: "google-user-2",
          }),
        },
        provider: "google",
      },
      remoteAddress,
      url: "/api/auth/sign-in/social",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json<SignInResponseBody>().user.id).toBe(
      otpCodeSignInResponse.json<SignInResponseBody>().user.id,
    );
  });

  it("rejects a Google id token whose email address Google hasn't verified, when a User already has that email address, with 401 and the code OAUTH_LINK_ERROR", async () => {
    const testUser = await createTestUser(runtime);

    const response = await server.inject({
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: testUser.user.email,
            email_verified: false,
            sub: "google-user-3",
          }),
        },
        provider: "google",
      },
      remoteAddress: "192.0.2.33",
      url: "/api/auth/sign-in/social",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ code: "OAUTH_LINK_ERROR" });
  });

  it("exchanges the authorization code that an Apple sign-in carries at Apple's token endpoint, with a client secret signed by the Apple key", async () => {
    await server.inject({
      headers: { [AUTHORIZATION_CODE_HEADER_NAME]: "apple-authorization-code" },
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "apple-exchange@example.com",
            email_verified: true,
            sub: "apple-user-3",
          }),
        },
        provider: "apple",
      },
      remoteAddress: "192.0.2.40",
      url: "/api/auth/sign-in/social",
    });

    const appleTokenRequest = socialProviderRequests.findLast(
      (socialProviderRequest) =>
        socialProviderRequest.url === "https://appleid.apple.com/auth/token",
    );

    expect(appleTokenRequest?.body).toMatchObject({
      ["client_id"]: "test.apple.app.bundle.identifier",
      code: "apple-authorization-code",
      ["grant_type"]: "authorization_code",
    });
    expect(
      decodeAppleClientSecret(appleTokenRequest?.body.client_secret),
    ).toMatchObject({
      header: { alg: "ES256", kid: "TESTKEY123" },
      isSignatureValid: true,
      payload: {
        aud: "https://appleid.apple.com",
        iss: "TESTTEAM12",
        sub: "test.apple.app.bundle.identifier",
      },
    });
  });

  it("exchanges the authorization code that a Google sign-in carries at Google's token endpoint, with the secret of the web client", async () => {
    await server.inject({
      headers: {
        [AUTHORIZATION_CODE_HEADER_NAME]: "google-authorization-code",
      },
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "google-exchange@example.com",
            email_verified: true,
            sub: "google-user-4",
          }),
        },
        provider: "google",
      },
      remoteAddress: "192.0.2.41",
      url: "/api/auth/sign-in/social",
    });

    expect(
      socialProviderRequests.findLast(
        (socialProviderRequest) =>
          socialProviderRequest.url === "https://oauth2.googleapis.com/token",
      )?.body,
    ).toStrictEqual({
      ["client_id"]: "test-google-web-client-id",
      ["client_secret"]: "test-google-client-secret",
      code: "google-authorization-code",
      ["grant_type"]: "authorization_code",
      ["redirect_uri"]: "",
    });
  });

  it("revokes at Apple, when the Account is deleted, the refresh token that Apple's token endpoint returned for the authorization code of its sign-in", async () => {
    const signInResponse = await server.inject({
      headers: { [AUTHORIZATION_CODE_HEADER_NAME]: "apple-authorization-code" },
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "apple-revocation@example.com",
            email_verified: true,
            sub: "apple-user-4",
          }),
        },
        provider: "apple",
      },
      remoteAddress: "192.0.2.42",
      url: "/api/auth/sign-in/social",
    });

    await deleteAccount({
      cookies: Object.fromEntries(
        signInResponse.cookies.map((cookie) => [cookie.name, cookie.value]),
      ),
      sentEmails,
      server,
    });

    expect(
      socialProviderRequests.findLast(
        (socialProviderRequest) =>
          socialProviderRequest.url === "https://appleid.apple.com/auth/revoke",
      )?.body,
    ).toMatchObject({
      ["client_id"]: "test.apple.app.bundle.identifier",
      token: "apple-refresh-token",
      ["token_type_hint"]: "refresh_token",
    });
  });

  it("revokes at Google, when the Account is deleted, the refresh token that Google's token endpoint returned for the authorization code of its sign-in", async () => {
    const signInResponse = await server.inject({
      headers: {
        [AUTHORIZATION_CODE_HEADER_NAME]: "google-authorization-code",
      },
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "google-revocation@example.com",
            email_verified: true,
            sub: "google-user-5",
          }),
        },
        provider: "google",
      },
      remoteAddress: "192.0.2.43",
      url: "/api/auth/sign-in/social",
    });

    await deleteAccount({
      cookies: Object.fromEntries(
        signInResponse.cookies.map((cookie) => [cookie.name, cookie.value]),
      ),
      sentEmails,
      server,
    });

    expect(
      socialProviderRequests.findLast(
        (socialProviderRequest) =>
          socialProviderRequest.url === "https://oauth2.googleapis.com/revoke",
      )?.body,
    ).toStrictEqual({ token: "google-refresh-token" });
  });

  it("signs the User in with an Apple id token when Apple's token endpoint rejects the authorization code that the sign-in carries", async () => {
    const socialProviderServer = await createSocialProviderServer({
      responses: {
        "https://appleid.apple.com/auth/token": () =>
          Response.json(
            { error: "invalid_grant" },
            { status: HTTP_STATUS_BAD_REQUEST },
          ),
      },
      sentEmails: [],
    });

    const response = await socialProviderServer.inject({
      headers: { [AUTHORIZATION_CODE_HEADER_NAME]: "apple-authorization-code" },
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "apple-rejected-code@example.com",
            email_verified: true,
            sub: "apple-user-5",
          }),
        },
        provider: "apple",
      },
      remoteAddress: "192.0.2.44",
      url: "/api/auth/sign-in/social",
    });
    await socialProviderServer.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: { email: "apple-rejected-code@example.com" },
    });
  });

  it("deletes the Account when Apple's revocation endpoint rejects its refresh token", async () => {
    const socialProviderSentEmails: SentEmail[] = [];
    const socialProviderServer = await createSocialProviderServer({
      responses: {
        "https://appleid.apple.com/auth/revoke": () =>
          Response.json(
            { error: "invalid_client" },
            { status: HTTP_STATUS_BAD_REQUEST },
          ),
        "https://appleid.apple.com/auth/token":
          SOCIAL_PROVIDER_RESPONSES["https://appleid.apple.com/auth/token"],
      },
      sentEmails: socialProviderSentEmails,
    });
    const signInResponse = await socialProviderServer.inject({
      headers: { [AUTHORIZATION_CODE_HEADER_NAME]: "apple-authorization-code" },
      method: "POST",
      payload: {
        idToken: {
          token: createUnsignedIdToken({
            email: "apple-rejected-revocation@example.com",
            email_verified: true,
            sub: "apple-user-6",
          }),
        },
        provider: "apple",
      },
      remoteAddress: "192.0.2.45",
      url: "/api/auth/sign-in/social",
    });
    const cookies = Object.fromEntries(
      signInResponse.cookies.map((cookie) => [cookie.name, cookie.value]),
    );

    const response = await deleteAccount({
      cookies,
      sentEmails: socialProviderSentEmails,
      server: socialProviderServer,
    });
    const sessionResponse = await socialProviderServer.inject({
      cookies,
      method: "GET",
      url: "/api/auth/get-session",
    });
    await socialProviderServer.close();

    expect(response.statusCode).toBe(200);
    expect(sessionResponse.json()).toBe(null);
  });

  it("emails only a /delete-account link on the API host, and deletes nothing, when /api/auth/delete-user is requested without a token", async () => {
    const testUser = await createTestUser(runtime);

    await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "POST",
      payload: {},
      url: "/api/auth/delete-user",
    });

    const response = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "GET",
      url: "/api/auth/get-session",
    });

    expect(sentEmails.at(-1)).toMatchObject({
      subject: "Confirm deleting your Ankaa account",
      to: testUser.user.email,
    });
    expect(sentEmails.at(-1)?.text).toMatch(DELETE_ACCOUNT_LINK_PATTERN);
    expect(response.json()).toMatchObject({ user: { id: testUser.user.id } });
  });

  it("deletes the User and every row they own when /api/auth/delete-user is requested with the token of the emailed link", async () => {
    const testUser = await createTestUser(runtime);
    const caller = await createSignedInCaller({ runtime, testUser });
    await caller.routine.save(buildRoutineSaveInput(DELETED_ROUTINE_ID));
    await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "POST",
      payload: {},
      url: "/api/auth/delete-user",
    });
    const token = /token=([\da-z]+)/.exec(String(sentEmails.at(-1)?.text))?.[1];

    const response = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "POST",
      payload: { token },
      url: "/api/auth/delete-user",
    });

    expect(response.statusCode).toBe(200);
    expect(
      await listRowsOwnedBy({
        routineId: DELETED_ROUTINE_ID,
        runtime,
        userId: testUser.user.id,
      }),
    ).toStrictEqual({
      routineDays: [],
      routines: [],
      sessions: [],
      users: [],
    });
  });

  it("deletes the User together with a Workout they started from one of their Routines when /api/auth/delete-user is requested with the token of the emailed link", async () => {
    const testUser = await createTestUser(runtime);
    const caller = await createSignedInCaller({ runtime, testUser });
    await caller.routine.save(
      buildRoutineSaveInput(DELETED_WORKOUT_ROUTINE_ID),
    );
    await caller.workout.start({
      id: DELETED_WORKOUT_ID,
      routineId: DELETED_WORKOUT_ROUTINE_ID,
    });
    await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "POST",
      payload: {},
      url: "/api/auth/delete-user",
    });
    const token = /token=([\da-z]+)/.exec(String(sentEmails.at(-1)?.text))?.[1];

    const response = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "POST",
      payload: { token },
      url: "/api/auth/delete-user",
    });

    expect(response.statusCode).toBe(200);
    expect(
      await listWorkoutsOwnedBy({ runtime, userId: testUser.user.id }),
    ).toStrictEqual([]);
  });

  it("rejects the token of another User's emailed link with 404 and the code INVALID_TOKEN, and keeps that User and every row they own", async () => {
    const linkOwner = await createTestUser(runtime);
    const otherUser = await createTestUser(runtime);
    const linkOwnerCaller = await createSignedInCaller({
      runtime,
      testUser: linkOwner,
    });
    await linkOwnerCaller.routine.save(buildRoutineSaveInput(KEPT_ROUTINE_ID));
    await server.inject({
      headers: Object.fromEntries(linkOwner.headers),
      method: "POST",
      payload: {},
      url: "/api/auth/delete-user",
    });
    const token = /token=([\da-z]+)/.exec(String(sentEmails.at(-1)?.text))?.[1];

    const response = await server.inject({
      headers: Object.fromEntries(otherUser.headers),
      method: "POST",
      payload: { token },
      url: "/api/auth/delete-user",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "INVALID_TOKEN" });
    await expect(
      (
        await createSignedInCaller({ runtime, testUser: linkOwner })
      ).routine.list(),
    ).resolves.toMatchObject([{ days: ["monday"], id: KEPT_ROUTINE_ID }]);
  });

  it("answers a tRPC procedure called by a signed-in User whose session cookie the request carries with its data", async () => {
    const testUser = await createTestUser(runtime);

    const response = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "GET",
      url: "/trpc/exercise.list",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({
      result: {
        data: [
          {
            amountUnit: "repetition",
            equipment: [],
            id: BENCH_PRESS_EXERCISE_ID,
            muscleGroups: [],
            name: "Bench Press (Barbell)",
            weightType: "total",
          },
        ],
      },
    });
  });

  it("answers a tRPC procedure called without a session with 401 and the UNAUTHORIZED code", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/trpc/exercise.list",
    });

    expect(response.statusCode).toBe(401);

    expect(response.json()).toMatchObject({
      error: {
        data: { code: "UNAUTHORIZED", httpStatus: 401, path: "exercise.list" },
        message: "UNAUTHORIZED",
      },
    });
  });

  it("answers a tRPC procedure that fails with a Wire error with the status of its code and the Wire error encoded in its data", async () => {
    const testUser = await createTestUser(runtime);

    const response = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "POST",
      payload: { id: "019a0000-0000-7000-8000-000000000001" },
      url: "/trpc/routine.delete",
    });

    expect(response.statusCode).toBe(404);

    expect(response.json()).toMatchObject({
      error: {
        data: {
          code: "NOT_FOUND",
          httpStatus: 404,
          path: "routine.delete",
          wireError: { _tag: "RoutineNotFoundError" },
        },
      },
    });
  });

  it("answers a tRPC procedure that fails with an internal error with 500, its message hidden and no Wire error", async () => {
    const failingServer = await createLoggingServer({
      authentication: {
        getSession: () => Effect.succeed(session),
      },
      exerciseApplicationService: {
        list: () =>
          Effect.die(
            new Error("Failed to connect to the database at 10.0.0.1"),
          ),
      },
      level: "silent",
      logLines: [],
    });

    const response = await failingServer.inject({
      method: "GET",
      url: "/trpc/exercise.list",
    });
    await failingServer.close();

    expect(response.statusCode).toBe(500);

    expect(response.json()).toMatchObject({
      error: {
        data: {
          code: "INTERNAL_SERVER_ERROR",
          httpStatus: 500,
          path: "exercise.list",
          wireError: null,
        },
        message: "Internal Server Error",
      },
    });
  });

  it("logs a tRPC call that fails with a status below 500 at info level", async () => {
    const logLines: unknown[] = [];
    const loggingServer = fastify({
      logger: {
        stream: {
          write: (logLine: string) => {
            logLines.push(JSON.parse(logLine));
          },
        },
      },
    });
    await loggingServer.register(applicationPlugin, {
      ...WELL_KNOWN_FILE_SETTINGS,
      runtime,
    });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining({
        level: 30,
        msg: 'Failed to handle tRPC request on path "exercise.list"',
      }),
    );
  });

  it("logs a tRPC call that the client closed at info level", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      authentication: { getSession: () => Effect.succeed(session) },
      exerciseApplicationService: { list: () => Effect.interrupt },
      level: "info",
      logLines,
    });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining<Record<string, unknown>>({
        err: expect.objectContaining<Record<string, unknown>>({
          code: "CLIENT_CLOSED_REQUEST",
        }),
        level: 30,
        msg: 'Failed to handle tRPC request on path "exercise.list"',
      }),
    );
  });

  it("writes an Effect log of a tRPC procedure to the log of its request, with the request's ID", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      authentication: {
        getSession: () => Effect.succeed(session),
      },
      exerciseApplicationService: {
        list: () => Effect.log("Listing the Exercises").pipe(Effect.as([])),
      },
      level: "info",
      logLines,
    });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining({
        msg: "Listing the Exercises",
        reqId: "request-1",
      }),
    );
  });

  it("writes an Effect log of the tRPC context's session read to the log of its request, with the request's ID", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      authentication: {
        getSession: () =>
          Effect.log("Reading the session").pipe(Effect.as(null)),
      },
      level: "info",
      logLines,
    });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining({
        msg: "Reading the session",
        reqId: "request-1",
      }),
    );
  });

  it("writes an Effect log of the better-auth route to the log of its request, with the request's ID", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      authentication: {
        handleRequest: () =>
          Effect.log("Handling the better-auth request").pipe(
            Effect.as(new Response(null)),
          ),
      },
      level: "info",
      logLines,
    });

    await loggingServer.inject({ method: "GET", url: "/api/auth/get-session" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining({
        msg: "Handling the better-auth request",
        reqId: "request-1",
      }),
    );
  });

  it("writes an Effect debug log when pino logs at debug level", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      authentication: {
        getSession: () =>
          Effect.logDebug("Reading the session").pipe(Effect.as(null)),
      },
      level: "debug",
      logLines,
    });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining({ level: 20, msg: "Reading the session" }),
    );
  });

  it("writes no Effect log when pino is silent", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      authentication: {
        getSession: () =>
          Effect.logError("Failed to read the session").pipe(Effect.as(null)),
      },
      level: "silent",
      logLines,
    });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toStrictEqual([]);
  });

  it("writes an Effect log of a failure that holds two errors as an AggregateError with the stack of each", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      authentication: {
        getSession: () =>
          Effect.logError(
            "Failed to read the session",
            Cause.combine(
              Cause.fail(new Error("Failed to read the session cookie")),
              Cause.die(new Error("Failed to reach the database")),
            ),
          ).pipe(Effect.as(null)),
      },
      level: "info",
      logLines,
    });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining<Record<string, unknown>>({
        err: expect.objectContaining<Record<string, unknown>>({
          aggregateErrors: [
            expect.objectContaining<Record<string, unknown>>({
              message: "Failed to read the session cookie",
              stack: expect.stringContaining(
                "Error: Failed to read the session cookie\n    at ",
              ),
            }),
            expect.objectContaining<Record<string, unknown>>({
              message: "Failed to reach the database",
              stack: expect.stringContaining(
                "Error: Failed to reach the database\n    at ",
              ),
            }),
          ],
          type: "AggregateError",
        }),
        msg: "Failed to read the session",
      }),
    );
  });

  it("writes an Effect log with its annotations and spans as fields, its string parts as the message and its Error part as the error", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      authentication: {
        getSession: () =>
          Effect.logWarning(
            "Failed to read",
            new Error("The session cookie expired"),
            "the session",
          ).pipe(
            Effect.annotateLogs({ userId: "user-1" }),
            Effect.withLogSpan("sessionRead"),
            Effect.as(null),
          ),
      },
      level: "info",
      logLines,
    });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining<Record<string, unknown>>({
        err: expect.objectContaining<Record<string, unknown>>({
          message: "The session cookie expired",
          type: "Error",
        }),
        level: 40,
        msg: "Failed to read the session",
        spans: expect.objectContaining<Record<string, unknown>>({
          sessionRead: expect.any(Number),
        }),
        userId: "user-1",
      }),
    );
  });

  it("answers /.well-known/apple-app-site-association with the app of its settings, for /delete-account links only", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/.well-known/apple-app-site-association",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/^application\/json/);
    expect(response.json()).toStrictEqual({
      applinks: {
        details: [
          {
            appIDs: ["ABCDE12345.app.ankaa.test"],
            components: [{ "/": "/delete-account*" }],
          },
        ],
      },
    });
  });

  it("answers /.well-known/assetlinks.json with the app and signing certificate fingerprints of its settings", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/.well-known/assetlinks.json",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/^application\/json/);
    expect(response.json()).toStrictEqual([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          ["package_name"]: "app.ankaa.test",
          ["sha256_cert_fingerprints"]: [
            "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5",
          ],
        },
      },
    ]);
  });

  it("answers /health with the status ok", async () => {
    const response = await server.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({ status: "ok" });
  });

  it("answers an unknown route with 404 and the method and URL of the request", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/unknown-route",
    });

    expect(response.statusCode).toBe(404);

    expect(response.json()).toStrictEqual({
      error: "Not Found",
      message: 'Route "GET /unknown-route" not found',
      statusCode: 404,
    });
  });

  it("leaves the query string out of the 404 of an unknown route, such as the token of a deletion link opened outside the app", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/delete-account?token=deletion-token",
    });

    expect(response.json()).toStrictEqual({
      error: "Not Found",
      message: 'Route "GET /delete-account" not found',
      statusCode: 404,
    });
  });

  it("answers an error of status 500 with its message hidden", async () => {
    server.get("/failing-route", () => {
      throw new Error("Failed to connect to the database at 10.0.0.1");
    });

    const response = await server.inject({
      method: "GET",
      url: "/failing-route",
    });

    expect(response.statusCode).toBe(500);

    expect(response.json()).toStrictEqual({
      error: "Internal Server Error",
      message: "Internal Server Error",
      statusCode: 500,
    });
  });

  it("answers an error of a status below 500 with the error itself", async () => {
    server.get("/rejecting-route", () => {
      throw Object.assign(new Error("The request has no name"), {
        statusCode: 400,
      });
    });

    const response = await server.inject({
      method: "GET",
      url: "/rejecting-route",
    });

    expect(response.statusCode).toBe(400);

    expect(response.json()).toStrictEqual({
      error: "Bad Request",
      message: "The request has no name",
      statusCode: 400,
    });
  });

  it("rejects a verification code request from an IP address that has already sent 3 in the last minute with 429 and the seconds to wait", async () => {
    const remoteAddress = "192.0.2.2";

    await sendOtpCodeRequests({ count: 3, remoteAddress, server });

    const response = await server.inject({
      method: "POST",
      payload: { email: "rate-limited@example.com", type: "sign-in" },
      remoteAddress,
      url: "/api/auth/email-otp/send-verification-otp",
    });

    expect(response.statusCode).toBe(429);
    expect(response.headers["x-retry-after"]).toBe("60");
  });

  it("leaves the better-auth route to better-auth's limits, answering it for an IP address over the limit of the other routes", async () => {
    const remoteAddress = "192.0.2.6";
    await sendRequestsUpToRateLimit({ remoteAddress, server });

    const response = await server.inject({
      method: "GET",
      remoteAddress,
      url: "/api/auth/get-session",
    });

    expect(response.statusCode).toBe(200);
  });

  it("answers a verification code request from an IP address under its limit while another IP address is over its own", async () => {
    await sendOtpCodeRequests({ count: 4, remoteAddress: "192.0.2.4", server });

    const response = await server.inject({
      method: "POST",
      payload: { email: "rate-limited@example.com", type: "sign-in" },
      remoteAddress: "192.0.2.5",
      url: "/api/auth/email-otp/send-verification-otp",
    });

    expect(response.statusCode).toBe(200);
  });

  it("rejects a verification code request from an IP address over its limit with 429 whatever X-Forwarded-For header it sends", async () => {
    const remoteAddress = "192.0.2.3";

    await sendOtpCodeRequests({ count: 3, remoteAddress, server });

    const response = await server.inject({
      headers: { "x-forwarded-for": "198.51.100.1" },
      method: "POST",
      payload: { email: "rate-limited@example.com", type: "sign-in" },
      remoteAddress,
      url: "/api/auth/email-otp/send-verification-otp",
    });

    expect(response.statusCode).toBe(429);
  });

  it("rejects a request from an IP address that has already sent 1000 requests in the last minute with 429", async () => {
    const remoteAddress = "192.0.2.1";

    await sendRequestsUpToRateLimit({ remoteAddress, server });

    const response = await server.inject({
      method: "GET",
      remoteAddress,
      url: "/health",
    });

    expect(response.statusCode).toBe(429);

    expect(response.json()).toStrictEqual({
      error: "Too Many Requests",
      message: "Rate limit exceeded, retry in 1 minute",
      statusCode: 429,
    });
  });
});
