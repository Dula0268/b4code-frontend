# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# --legacy-peer-deps: next-intl bundles its own @swc/core whose optional peerDependency
# on @swc/helpers doesn't match next's pinned version. npm's newer peer resolver treats
# this as a hard lockfile-sync error under `npm ci` even though the peer is optional and
# harmless; the legacy resolver (pre-npm7 behavior) ignores it like earlier npm always did.
RUN npm ci --legacy-peer-deps

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so this has to be
# supplied here as a build arg. Passing it to `docker run` instead has no effect on client
# code, which would silently fall back to the http://localhost:8080 default in src/lib/axios.ts.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 3: Production runner (minimal image)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
