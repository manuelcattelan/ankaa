# Server

## Structure

- Configure the process in `src/index.ts`: Fastify instance options, `closeWithGrace` and `listen`.
- Configure the root scope in `src/application.ts`: loading `plugins/` and `routes/`, and handlers that apply to every route, such as the error and not-found handlers.
- Put each plugin in `src/plugins/<library>.ts`, wrapped in `fastifyPlugin`.
- Put each route in `src/routes/<url path>/index.ts`. Write API procedures in `packages/api`, not as routes.

## Fastify

Every plugin, log and error response is written the same way.

- Always `await` a call to `server.register()`.
- Log with `request.log` inside a handler, and with `server.log` everywhere else.
- Send every HTTP error with the shape `{ statusCode, code, error, message }`. `code` is optional.

Do:

```ts
return reply.status(HTTP_STATUS_NOT_FOUND).send({
  error: "Not Found",
  message: `Route "${request.method} ${request.url}" not found`,
  statusCode: HTTP_STATUS_NOT_FOUND,
});
```

Don't:

```ts
return reply.status(500).send({
  code: "AUTH_FAILURE",
  error: "Internal authentication error",
});
```
