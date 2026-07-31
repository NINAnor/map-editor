FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG VITE_DEFAULT_CONFIGURATION="/maps"
ARG VITE_HIDE_EDIT_BUTTON="false"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./


FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --no-frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile
COPY src src/
COPY public public/
COPY vite.config.ts index.html tsconfig.app.json tsconfig.json tsconfig.node.json ./
RUN pnpm run build

FROM base AS frontend
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile
COPY src src/
COPY public public/
COPY vite.config.ts index.html tsconfig.app.json tsconfig.json tsconfig.node.json ./
EXPOSE 5173
CMD ["pnpm", "run", "dev"]


FROM nginx:stable-alpine-slim AS nginx

COPY nginx/default.conf.template /etc/nginx/templates/
COPY --from=build /app/dist /var/www/


FROM denoland/deno:2.9.4 AS server

WORKDIR /app

COPY deno.json package.json ./
COPY src/server.ts src/map-config.ts src/
COPY src/schemas/ src/schemas/

RUN deno cache --sloppy-imports src/server.ts

EXPOSE 8080
ENV PORT=8080

CMD ["run", "--sloppy-imports", "--allow-net", "--allow-env=PORT", "src/server.ts"]
