# syntax=docker/dockerfile:1

# ── Stage 1: сборка клиента ──────────────────────────────
FROM node:22-alpine AS client-build
WORKDIR /client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ── Stage 2: сборка сервера ──────────────────────────────
FROM node:22-alpine AS server-build
WORKDIR /server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ── Stage 3: рантайм ─────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Только прод-зависимости сервера
COPY server/package*.json ./
RUN npm ci --omit=dev

# Скомпилированный сервер + сид-данные + собранный клиент
COPY --from=server-build /server/dist ./dist
COPY --from=client-build /client/dist ./dist/public

EXPOSE 3001
CMD ["node", "dist/index.js"]
