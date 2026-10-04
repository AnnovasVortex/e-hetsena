# Image du frontend Next.js — à construire depuis la racine du monorepo :
#   docker build -f apps/web/Dockerfile --build-arg API_URL=https://api.example.com .
FROM node:22-bookworm-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
# URL de l'API figée dans les rewrites /api/* au moment du build
ARG API_URL
ENV API_URL=${API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@e-hetsena/web...

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080
CMD ["node", "apps/web/server.js"]
