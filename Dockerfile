# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies with npm
RUN npm ci --loglevel verbose || npm install --legacy-peer-deps --loglevel verbose

# Copy the rest of the code
COPY . .

# Build the application using npx to find the local nest binary
RUN npx nest build

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
