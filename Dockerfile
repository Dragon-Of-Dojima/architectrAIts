# syntax=docker/dockerfile:1

# Debian slim (glibc) is used instead of alpine to avoid native-module
# (sharp) musl headaches with Next's image optimizer.
FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate
WORKDIR /app

# ---- build: install all workspace deps and compile the web app ----
FROM base AS build
# Copy manifests first so `pnpm install` is cached across source-only changes.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/storage/package.json ./packages/storage/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Application source.
COPY . .

# The pages are force-dynamic so `next build` never connects to anything, but
# the db/storage modules throw at import time when these are unset. Provide
# throwaway values for the build; real values are injected at runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV S3_BUCKET="build-placeholder"
ENV AWS_REGION="us-east-1"
RUN pnpm --filter web build

# ---- runner: minimal standalone runtime image ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3300
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3300
CMD ["node", "apps/web/server.js"]
