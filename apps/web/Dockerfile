FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
# Copy root package/lock and turborepo configs
COPY package.json package-lock.json turbo.json ./
# Copy workspace apps and packages
COPY apps/web ./apps/web
COPY packages ./packages
# Due to monorepo, install dependencies at root
RUN npm ci

# Build the web app
WORKDIR /app/apps/web
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files specifically for Next.js standalone if enabled, else normal start
# Assuming standard Next build for simplicity in this demo. 
# For production scale, Next.js output: 'standalone' should be enabled in next.config.mjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

WORKDIR /app/apps/web
CMD ["npm", "start"]
EXPOSE 3000
