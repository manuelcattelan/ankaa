import helmet from "@fastify/helmet";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async (server) => {
  await server.register(helmet);
});
