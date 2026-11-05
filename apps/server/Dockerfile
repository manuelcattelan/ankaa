ARG NODE_IMAGE=node:26-slim@sha256:e4db4c914bf8ad241bd24804fc25d272d89bad97e68cdc8a1414862790a02c39

FROM ${NODE_IMAGE} AS base
# Node.js no longer ships Corepack, so pnpm comes from its own image
# (https://pnpm.io/docker), tagged with the version that `devEngines` pins,
# because `pmOnFail: ignore` keeps pnpm from switching to it.
COPY --from=ghcr.io/pnpm/pnpm:12.16.1@sha256:33081d3d2c96ba582d316cfd630f0f43961d9c60ff919b50edd1835a1462976b /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin"; done
WORKDIR /app

FROM base AS prune
COPY . .
# The version that `pnpm-lock.yaml` resolves for the root's `turbo`, so the
# prune is reproducible.
RUN pnpm dlx turbo@2.11.10 prune @ankaa/server --docker

FROM base AS install
COPY --from=prune /app/out/json/ .
# `--filter-prod` leaves out the workspace packages that the server reaches
# only through devDependencies, such as `@ankaa/eslint`, whose own
# dependencies `--prod` alone would install (https://pnpm.io/filtering).
RUN pnpm install --frozen-lockfile --prod --filter-prod "@ankaa/server..."
COPY --from=prune /app/out/full/ .

FROM ${NODE_IMAGE}
WORKDIR /app
COPY --from=install /app .
USER node
CMD ["node", "apps/server/src/server.ts"]
