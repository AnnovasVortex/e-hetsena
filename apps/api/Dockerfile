# Image de l'API NestJS — à construire depuis la racine du monorepo :
#   docker build -f apps/api/Dockerfile .
FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@e-hetsena/api...

FROM base AS runtime
ENV NODE_ENV=production
# On garde node_modules complet : le CLI Prisma sert aussi au job de migration (db push)
COPY --from=build /app /app
WORKDIR /app/apps/api
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/main.js"]
