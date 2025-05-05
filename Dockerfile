# === Build Stage ===
FROM node:20 AS builder

WORKDIR /app

# Copy package files, prisma schema, and .env
COPY package*.json ./
COPY src/prisma ./src/prisma
COPY .env ./

# Install dependencies (including devDependencies)
RUN npm install --production=false

# Generate Prisma client (specify schema path)
RUN npx prisma generate --schema=src/prisma/schema.prisma

COPY . .

# Build the app
RUN npm run build

# === Production Stage ===
FROM node:20-slim

# Install OpenSSL and other required libs
RUN apt-get update -y && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy required files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./

EXPOSE 8080

CMD ["node", "dist/main"]