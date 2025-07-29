# Tahap 1: Gunakan image Node.js untuk build
FROM node:18-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Tahap 2: Buat image production
FROM node:18-alpine

WORKDIR /app

# Copy output build dari builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV NODE_ENV=production
CMD ["node", "server.js"]
