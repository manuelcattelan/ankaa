import rateLimit from "@fastify/rate-limit";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async (server) => {
  await server.register(rateLimit);
});
