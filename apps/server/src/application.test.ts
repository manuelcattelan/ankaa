import type { TestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";
import type { FastifyInstance } from "fastify";

import { createTestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";
import { createTestDatabase } from "@ankaa/vitest/create-test-database";
import { createTestRuntime } from "@ankaa/vitest/create-test-runtime";
import { createTestUser } from "@ankaa/vitest/create-test-user";
import { dropTestDatabase } from "@ankaa/vitest/drop-test-database";
import {
  afterAll,
  afterEach,
  beforeAll,
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
  let testDatabaseUrl: string;
  let runtime: ReturnType<typeof createTestRuntime>;
  let testAuthentication: TestAuthentication;
  let server: FastifyInstance;

  beforeAll(async () => {
    testDatabaseUrl = await createTestDatabase();
    runtime = createTestRuntime(testDatabaseUrl);
    testAuthentication = await runtime.runPromise(createTestAuthentication());
  });

  beforeEach(async () => {
    server = fastify();

    await server.register(applicationPlugin, { runtime });
  });

  afterEach(async () => {
    await server.close();
  });

  afterAll(async () => {
    await runtime.dispose();

    await dropTestDatabase(testDatabaseUrl);
  });

  it("answers /api/auth/get-session with the session of the signed-in user whose session cookie the request carries", async () => {
    const testUser = await createTestUser(testAuthentication);

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
