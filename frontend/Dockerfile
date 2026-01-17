FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Set build-time environment variables
ARG PUBLIC_APP_MODE=local
ARG PUBLIC_BACKEND_URL=http://localhost:8000

ENV PUBLIC_APP_MODE=$PUBLIC_APP_MODE
ENV PUBLIC_BACKEND_URL=$PUBLIC_BACKEND_URL

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 4321

ENV HOST=0.0.0.0
ENV PORT=4321

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
