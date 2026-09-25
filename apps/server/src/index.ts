import closeWithGrace from "close-with-grace";
import fastify from "fastify";

import { application } from "./application.ts";
import { environment } from "./environment.ts";

const LOGGER_CONFIGURATIONS = {
  development: {
    transport: {
      options: { ignore: "pid,hostname", translateTime: "HH:MM:ss Z" },
      target: "pino-pretty",
    },
  },
  production: true,
};

const ROUTER_MAXIMUM_PARAMETER_LENGTH = 5_000;

const server = fastify({
  logger: LOGGER_CONFIGURATIONS[environment.NODE_ENV],
  routerOptions: { maxParamLength: ROUTER_MAXIMUM_PARAMETER_LENGTH },
});

await server.register(application);

closeWithGrace(
  { delay: environment.CLOSE_GRACE_DELAY_MILLISECONDS, logger: server.log },
  async ({ err: error }) => {
    if (error) {
      server.log.error(error, "Closing server after an uncaught error");
    }

    await server.close();
  },
);

try {
  await server.listen({
    host: environment.SERVER_HOST,
    port: environment.SERVER_PORT,
  });
} catch (error) {
  server.log.error(error, "Failed to start server");
  process.exit(1);
}
