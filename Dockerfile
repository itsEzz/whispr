FROM node:lts-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --gid 1001 --uid 999 sveltekit

RUN mkdir /app/logs && chown sveltekit:nodejs /app/logs

USER sveltekit

COPY --from=prod-deps --chown=sveltekit:nodejs /app/node_modules /app/node_modules
COPY --from=build --chown=sveltekit:nodejs /app/build /app/build
COPY --from=build --chown=sveltekit:nodejs /app/package.json /app/package.json

WORKDIR /app

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "build"]
