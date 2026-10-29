import type { applicationLayer } from "@ankaa/api/layer";
import type { SendEmailOptions } from "@ankaa/email";
import type { FastifyInstance } from "fastify";

import { ExerciseApplicationService } from "@ankaa/api/features/exercise/exercise-application-service";
import { Authentication } from "@ankaa/authentication";
import { createTestRuntime } from "@ankaa/vitest/create-test-runtime";
import { createTestUser } from "@ankaa/vitest/create-test-user";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "@effect/vitest";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import fastify from "fastify";

import { applicationPlugin } from "./application.ts";
import { createLoggerLayer } from "./logger.ts";

type CreateLoggingServerOptions = {
  layer: Layer.Layer<Layer.Success<typeof applicationLayer>>;
  level: string;
  logLines: unknown[];
};

type SendRequestsUpToRateLimitOptions = {
  remoteAddress: string;
  server: FastifyInstance;
};

const OTP_CODE_PATTERN = /^\d{6}$/;

const RATE_LIMIT_MAXIMUM_REQUEST_COUNT = 1_000;

const REQUEST_ID = "request-1";

const SESSION = {
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
}: CreateLoggingServerOptions) {
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

function sendRequestsUpToRateLimit({
  remoteAddress,
  server,
}: SendRequestsUpToRateLimitOptions) {
  return Promise.all(
    Array.from({ length: RATE_LIMIT_MAXIMUM_REQUEST_COUNT }, () =>
      server.inject({ method: "GET", remoteAddress, url: "/health" }),
    ),
  );
}

describe("applicationPlugin", () => {
  const sentEmails: SendEmailOptions[] = [];
  const runtime = createTestRuntime(sentEmails);
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

  it("answers /api/auth/get-session with the session of the signed-in person whose session cookie the request carries", async () => {
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

  it("answers a tRPC procedure called by a signed-in person whose session cookie the request carries with its data", async () => {
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
          getSession: () => Effect.succeed(SESSION),
        }),
        Layer.mock(ExerciseApplicationService, {
          list: () => Effect.log("Listing the Exercises").pipe(Effect.as([])),
        }),
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
