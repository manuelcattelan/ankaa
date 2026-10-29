import type { applicationLayer } from "@ankaa/api/application-layer";
import type { SendEmailOptions } from "@ankaa/email/email";
import type { FastifyInstance } from "fastify";

import { ExerciseApplicationService } from "@ankaa/api/features/exercise/exercise-application-service";
import { RoutineApplicationService } from "@ankaa/api/features/routine/routine-application-service";
import { createTestRuntime } from "@ankaa/api/shared/testing/create-test-runtime";
import { Authentication } from "@ankaa/authentication/authentication";
import { AuthenticationTestHelpers } from "@ankaa/authentication/testing/authentication-test-helpers";
import { createTestUser } from "@ankaa/authentication/testing/create-test-user";
import { Database } from "@ankaa/database/database";
import { verification } from "@ankaa/database/schema/authentication";
import { fakeEmailLayer } from "@ankaa/email/testing/fake-email-layer";
import { fakeStalledEmailLayer } from "@ankaa/email/testing/fake-stalled-email-layer";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import fastify from "fastify";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

import { applicationPlugin } from "#/application-plugin.ts";
import { createLoggerLayer } from "#/create-logger-layer.ts";

type SignInResponseBody = {
  user: { id: string };
};

const OTP_CODE_PATTERN = /^\d{6}$/;

const RATE_LIMIT_MAXIMUM_REQUEST_COUNT = 1000;

const REQUEST_ID = "request-1";

const UUID_V7_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/;

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
    email: "athlete@example.com",
    emailVerified: true,
    id: "user-1",
    name: "Athlete",
    updatedAt: new Date("2026-10-29T10:00:00.000Z"),
  },
};

async function createLoggingServer({
  layer,
  level,
  logLines,
}: {
  layer: Layer.Layer<Layer.Success<typeof applicationLayer>>;
  level: string;
  logLines: unknown[];
}) {
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

  await server.register(applicationPlugin, { runtime });

  return server;
}

function createUnsignedIdToken(claims: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");

  return `${header}.${payload}.`;
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
  const sentEmails: SendEmailOptions[] = [];
  const runtime = createTestRuntime(fakeEmailLayer(sentEmails));
  let server: FastifyInstance;

  beforeEach(async () => {
    server = fastify();

    await server.register(applicationPlugin, { runtime });
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
      payload: { email: "athlete@example.com", type: "sign-in" },
      url: "/api/auth/email-otp/send-verification-otp",
    });

    expect(sentEmails).toMatchObject([
      { subject: "Your sign-in verification code", to: "athlete@example.com" },
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
    const stalledSentEmails: SendEmailOptions[] = [];
    const stalledEmailRuntime = createTestRuntime(
      fakeStalledEmailLayer(stalledSentEmails),
    );
    const stalledEmailServer = fastify();
    await stalledEmailServer.register(applicationPlugin, {
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

  it("answers a tRPC procedure called by a signed-in User whose session cookie the request carries with its data", async () => {
    const testUser = await createTestUser(runtime);

    const response = await server.inject({
      headers: Object.fromEntries(testUser.headers),
      method: "GET",
      url: "/trpc/exercise.list",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({ ["result"]: { data: [] } });
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
      layer: Layer.mergeAll(
        Layer.mock(Authentication, {
          getSession: () => Effect.succeed(session),
        }),
        Layer.mock(ExerciseApplicationService, {
          list: () =>
            Effect.die(
              new Error("Failed to connect to the database at 10.0.0.1"),
            ),
        }),
        Layer.mock(RoutineApplicationService, {}),
      ),
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
    await loggingServer.register(applicationPlugin, { runtime });

    await loggingServer.inject({ method: "GET", url: "/trpc/exercise.list" });
    await loggingServer.close();

    expect(logLines).toContainEqual(
      expect.objectContaining({
        level: 30,
        msg: 'Failed to handle tRPC request on path "exercise.list"',
      }),
    );
  });

  it("writes an Effect log of a tRPC procedure to the log of its request, with the request's ID", async () => {
    const logLines: unknown[] = [];
    const loggingServer = await createLoggingServer({
      layer: Layer.mergeAll(
        Layer.mock(Authentication, {
          getSession: () => Effect.succeed(session),
        }),
        Layer.mock(ExerciseApplicationService, {
          list: () => Effect.log("Listing the Exercises").pipe(Effect.as([])),
        }),
        Layer.mock(RoutineApplicationService, {}),
      ),
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
      layer: Layer.mergeAll(
        Layer.mock(Authentication, {
          getSession: () =>
            Effect.log("Reading the session").pipe(Effect.as(null)),
        }),
        Layer.mock(ExerciseApplicationService, {}),
        Layer.mock(RoutineApplicationService, {}),
      ),
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
      layer: Layer.mergeAll(
        Layer.mock(Authentication, {
          handleRequest: () =>
            Effect.log("Handling the better-auth request").pipe(
              Effect.as(new Response(null)),
            ),
        }),
        Layer.mock(ExerciseApplicationService, {}),
        Layer.mock(RoutineApplicationService, {}),
      ),
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
      layer: Layer.mergeAll(
        Layer.mock(Authentication, {
          getSession: () =>
            Effect.logDebug("Reading the session").pipe(Effect.as(null)),
        }),
        Layer.mock(ExerciseApplicationService, {}),
        Layer.mock(RoutineApplicationService, {}),
      ),
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
      layer: Layer.mergeAll(
        Layer.mock(Authentication, {
          getSession: () =>
            Effect.logError("Failed to read the session").pipe(Effect.as(null)),
        }),
        Layer.mock(ExerciseApplicationService, {}),
        Layer.mock(RoutineApplicationService, {}),
      ),
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
      layer: Layer.mergeAll(
        Layer.mock(Authentication, {
          getSession: () =>
            Effect.logError(
              "Failed to read the session",
              Cause.combine(
                Cause.fail(new Error("Failed to read the session cookie")),
                Cause.die(new Error("Failed to reach the database")),
              ),
            ).pipe(Effect.as(null)),
        }),
        Layer.mock(ExerciseApplicationService, {}),
        Layer.mock(RoutineApplicationService, {}),
      ),
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
      layer: Layer.mergeAll(
        Layer.mock(Authentication, {
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
        }),
        Layer.mock(ExerciseApplicationService, {}),
        Layer.mock(RoutineApplicationService, {}),
      ),
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
