# Single stage build
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all packages and apps source
COPY packages ./packages
COPY apps ./apps

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build all packages
RUN pnpm -r run build

EXPOSE 3000

CMD ["node", "apps/bot/dist/index.js"]
