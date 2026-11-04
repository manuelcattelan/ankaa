import type { FastifyRequest } from "fastify";

/**
 * Returns the IP address of the client that sent `request`. Behind Fly.io's
 * proxy, `request.ip` is the proxy's address, so this reads the client's from
 * the `Fly-Client-IP` header, which the proxy sets on every request
 * (https://docs.fly.io/networking/request-headers), and falls back to the
 * socket's address when the header is missing, as in development and in
 * health checks.
 */
export function getClientIpAddress(request: FastifyRequest) {
  const flyClientIpAddress = request.headers["fly-client-ip"];

  return typeof flyClientIpAddress === "string"
    ? flyClientIpAddress
    : request.ip;
}
