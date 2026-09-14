FROM node:20-alpine AS base

# Install necessary libraries for Alpine (Prisma compatibility)
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Builder stage
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG PORT=3000
ARG DATABASE_URL="file:./dev.db"
ARG NEXTAUTH_SECRET="servicios-sp-secret-key-2026"
ARG NEXTAUTH_URL="https://serviciosysuministrossp.store"
ARG RESEND_API_KEY=""

ENV PORT=$PORT
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Runner stage
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permissions
RUN mkdir -p /app && chown -R nextjs:nodejs /app

# Copy public assets and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy database & Prisma files and ensure writable by nextjs user
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/dev.db ./dev.db

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
