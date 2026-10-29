import type { SendEmailOptions } from "@ankaa/email";
import type { FastifyInstance } from "fastify";

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
import fastify from "fastify";

import { applicationPlugin } from "./application.ts";

type SendRequestsUpToRateLimitOptions = {
  remoteAddress: string;
  server: FastifyInstance;
};

const OTP_CODE_PATTERN = /^\d{6}$/;

const RATE_LIMIT_MAXIMUM_REQUEST_COUNT = 1_000;

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
