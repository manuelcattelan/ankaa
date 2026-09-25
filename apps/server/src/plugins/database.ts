import { database } from "@ankaa/database";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin((server, options, done) => {
  server.addHook("onClose", async () => {
    await database.$client.end();
  });

  done();
});
