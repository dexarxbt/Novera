# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages ./packages
COPY apps ./apps

RUN pnpm install --frozen-lockfile
RUN pnpm -r run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages ./packages
COPY apps ./apps

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/ai/dist ./packages/ai/dist
COPY --from=builder /app/packages/memory/dist ./packages/memory/dist
COPY --from=builder /app/apps/bot/dist ./apps/bot/dist

EXPOSE 3000

CMD ["node", "apps/bot/dist/index.js"]
