# Stage 1: Build the Next.js application
FROM node:18 AS builder

WORKDIR /app

# First copy only package files to leverage Docker cache
COPY package*.json ./
RUN npm ci 

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

LABEL org.opencontainers.image.source=https://gitlab.com/acp-group/acp-innsbruck/ibk_demo_ai_auto_docu
LABEL org.opencontainers.image.description="Next.js application"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Only install production dependencies
RUN npm ci --omit=dev 

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public


EXPOSE 3000

CMD ["npm", "start"]