# Server

## Structure

The server follows Fastify's own split between the server and the application plugin, with "app" written in full:

- `src/server.ts` is the Composition root of the server, and it sets up and runs the process. It creates Fastify with its logger, builds the Runtime with `ManagedRuntime.make(applicationLayer)`, and awaits `runtime.context()`, so configuration and connection errors fail at boot. Then it registers `src/application.ts` with `{ runtime }`, adds an `onClose` hook that calls `runtime.dispose()`, and calls `closeWithGrace` and `listen`. Fastify documents `onClose` as the place to release resources once in-flight requests have completed. `src/server.ts` holds what a test leaves out when it builds the server and calls `server.inject()`, such as the Fastify instance options, `closeWithGrace` and `listen`. See https://fastify.dev/docs/latest/Guides/Testing/.
- `src/application.ts` assembles the server. It is registered with `fastifyPlugin`, as Fastify's official demo does, so its error and not-found handlers apply to every route. It loads `plugins/`, then sets the error and not-found handlers, then loads `routes/`, so the handlers and routes can use what the plugins add. See https://fastify.dev/docs/latest/Guides/Getting-Started/#loading-order-of-your-plugins.
- `src/layer.ts` defines `applicationLayer`, the application Layer that combines every Layer the server needs.
- `src/logger.ts` holds the Effect logger, built with `Logger.make` and installed with `Logger.layer`, that sends the logs of Effect programs to Fastify's pino logger.
- Every other shared capability of Fastify is a plugin in `src/plugins/<concept>.ts`, wrapped in `fastifyPlugin` so the whole server can use what it adds. See https://fastify.dev/docs/latest/Reference/Plugins/#handle-the-scope.
- Every API procedure lives in `packages/api`, so the mobile app gets its types through `AppRouter`. A route in `src/routes/<path>/index.ts` is only for an endpoint that tRPC doesn't serve, such as the Better Auth handler. The directory path becomes the URL prefix. See https://github.com/fastify/fastify-autoload.

## Procedures

Every procedure in `packages/api` runs its Interactor through the one runner in `packages/api/src/trpc/run.ts`, so every procedure fails the same way:

- The runner takes the Runtime from tRPC's inner context, provides `CurrentSession` with `Effect.provideService`, passes tRPC's abort `signal`, and runs the Interactor with `runPromiseExit`.
- The `router.ts` of each Feature supplies the mapping from the errors of that Feature to tRPC codes, and the runner applies it. The runner turns defects and interruptions into `INTERNAL_SERVER_ERROR`, with the original as the cause.
- To fail a procedure, fail its Interactor with a `Data.TaggedError` from the `errors/` folder of its Feature, and map that error in the `router.ts` of the Feature, so expected errors stay typed until the boundary and only the runner reports defects.
- Put an error class that the Interactors of several server Features fail with in `packages/api/src/shared/errors/`, and map it in the `router.ts` of each Feature, so the error has one class and one tag while each Feature still maps every error its procedures can fail with.

## Fastify

Where Fastify allows more than one way to do something, follow the conventions below. For everything else, follow the Fastify documentation at https://fastify.dev/docs/latest/.

- Await every call to `server.register()`. Fastify also allows calls without `await`, but awaiting every call keeps them consistent and guarantees that the decorators and hooks a plugin adds, such as `server.rateLimit()`, are ready before the code below uses them. See https://fastify.dev/docs/latest/Reference/Plugins/#asyncawait.
- Log with `request.log` wherever a `request` is available, and with `server.log` everywhere else, so every log line carries the request ID. In an Effect program, log with Effect's logging functions, such as `Effect.log`, which `src/logger.ts` sends to the same pino logger. See https://fastify.dev/docs/latest/Reference/Logging/.
- In a route in `src/routes/`, throw an error with a `statusCode` to fail a request, so the error handler in `src/application.ts` logs it and hides the message of errors of 500 and above. Only that handler and the not-found handler build error responses, in the shape that https://fastify.dev/docs/latest/Reference/Errors/ describes.
