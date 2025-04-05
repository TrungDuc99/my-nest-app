# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Install build essentials
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install ALL dependencies including dev dependencies
# We're in the build stage so we need everything
RUN npm install --loglevel verbose --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Show directory content for debugging
RUN ls -la && \
  echo "Node modules:" && \
  ls -la node_modules/.bin/

# Try to build with verbose logging
RUN NODE_ENV=development npx --verbose nest build --webpack --webpackPath webpack-hmr.config.js || \
  NODE_ENV=development npx --verbose nest build || \
  npm run build -- --verbose

# Stage 2: Run app
FROM node:18-alpine
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy compiled JavaScript files and necessary configurations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/environments ./environments

# Install production dependencies only
RUN npm ci --only=production --loglevel verbose || npm install --only=production --legacy-peer-deps --loglevel verbose

EXPOSE 3000

CMD ["node", "dist/main.js"]
