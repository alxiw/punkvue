# syntax=docker/dockerfile:1

# --- Build stage: type-check and bundle the SPA ---------------------------------
FROM node:24-alpine AS build

WORKDIR /app

# Pin the package manager: the lockfile is v9 and was generated with this pnpm.
# Bump the version here together with the local toolchain.
RUN npm install --global pnpm@12.14.0

# Manifests first, so the dependency layer is cached until the lockfile changes.
# pnpm-workspace.yaml carries the `allowBuilds` settings pnpm needs for installs.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# VITE_API_BASE_URL is inlined into the bundle at build time, so it has to be set
# right here — a runtime .env on the server would have no effect. The build aborts
# when it is missing (see vite.config.ts).
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm build

# --- Runtime stage: static files behind nginx -----------------------------------
FROM nginx:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --quiet --spider http://127.0.0.1/ || exit 1
