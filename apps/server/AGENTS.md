# Server

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
