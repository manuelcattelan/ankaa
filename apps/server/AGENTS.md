# Server

## Structure

- `src/index.ts` sets up and runs the process. It holds what a test leaves out when it builds the server and calls `server.inject()`, such as the Fastify instance options, `closeWithGrace` and `listen`. See https://fastify.dev/docs/latest/Guides/Testing/.
- `src/application.ts` assembles the server. It loads `plugins/`, then sets the error and not-found handlers, then loads `routes/`, so the handlers and routes can use what the plugins add. See https://fastify.dev/docs/latest/Guides/Getting-Started/#loading-order-of-your-plugins.
- Every other shared capability is a plugin in `src/plugins/<concept>.ts`, wrapped in `fastifyPlugin` so the whole server can use what it adds. See https://fastify.dev/docs/latest/Reference/Plugins/#handle-the-scope.
- Every API procedure lives in `packages/api`, so the mobile app gets its types through `AppRouter`. A route in `src/routes/<path>/index.ts` is only for an endpoint that tRPC doesn't serve, such as the Better Auth handler. The directory path becomes the URL prefix. See https://github.com/fastify/fastify-autoload.

## Fastify

Where Fastify allows more than one way to do something, follow the conventions below. For everything else, follow the Fastify documentation at https://fastify.dev/docs/latest/.

- Await every call to `server.register()`. Fastify also allows calls without `await`, but awaiting every call keeps them consistent and guarantees that the decorators and hooks a plugin adds, such as `server.rateLimit()`, are ready before the code below uses them. See https://fastify.dev/docs/latest/Reference/Plugins/#asyncawait.
- Log with `request.log` wherever a `request` is available, and with `server.log` everywhere else, so every log line carries the request ID. See https://fastify.dev/docs/latest/Reference/Logging/.
- Throw an error with a `statusCode` to fail a request, so the error handler in `src/application.ts` logs it and hides the message of errors of 500 and above. Only that handler and the not-found handler build error responses, in the shape that https://fastify.dev/docs/latest/Reference/Errors/ describes. A route that forwards another library's response, such as Better Auth or tRPC, sends it unchanged.
