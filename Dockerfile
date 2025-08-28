FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install dotenv
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

COPY --from=prod-deps --chown=sveltekit:nodejs /app/node_modules /app/node_modules
COPY --from=build --chown=sveltekit:nodejs /app/build /app/build
COPY --from=build --chown=sveltekit:nodejs /app/package.json /app/package.json
RUN mkdir /app/logs && chown sveltekit:nodejs /app/logs

USER sveltekit

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "-r", "dotenv/config", "build"]

