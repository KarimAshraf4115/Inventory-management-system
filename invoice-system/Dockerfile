# ---------- Stage 1: build ----------
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
# The generated Prisma client is gitignored, so it must be regenerated here
RUN npx prisma generate && npm run build

# ---------- Stage 2: run ----------
FROM node:22-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=file:/data/dev.db

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./

RUN mkdir -p /data
EXPOSE 3000

# Apply migrations, then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]