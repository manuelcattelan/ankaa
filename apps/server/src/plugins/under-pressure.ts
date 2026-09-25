import underPressure from "@fastify/under-pressure";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async (server) => {
  await server.register(underPressure, { exposeStatusRoute: "/health" });
});
