FROM node:26-slim AS base
# Node.js no longer ships Corepack, so pnpm comes from its own image, then
# switches to the version that `devEngines` pins (https://pnpm.io/docker).
COPY --from=ghcr.io/pnpm/pnpm:12 /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin"; done
WORKDIR /app

FROM base AS prune
COPY . .
RUN pnpm dlx turbo@2 prune @ankaa/server --docker

FROM base AS install
COPY --from=prune /app/out/json/ .
# `--filter-prod` leaves out the workspace packages that the server reaches
# only through devDependencies, such as `@ankaa/eslint`, whose own
# dependencies `--prod` alone would install (https://pnpm.io/filtering).
RUN pnpm install --frozen-lockfile --prod --filter-prod "@ankaa/server..."
COPY --from=prune /app/out/full/ .

FROM node:26-slim
WORKDIR /app
COPY --from=install /app .
USER node
CMD ["node", "apps/server/src/server.ts"]
