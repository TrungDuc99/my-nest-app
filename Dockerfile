# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PATH:$PNPM_HOME

# Install pnpm with specific version
RUN npm install -g pnpm@7.x

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with more verbose output
RUN pnpm config set auto-install-peers true && \
  pnpm install --frozen-lockfile --no-strict-peer-dependencies --loglevel verbose

# Copy the rest of the code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Run app
FROM node:18-alpine
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PATH:$PNPM_HOME

# Install pnpm with specific version
RUN npm install -g pnpm@7.x

# Copy compiled JavaScript files and necessary configurations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/environments ./environments

# Install production dependencies only
RUN pnpm config set auto-install-peers true && \
  pnpm install --prod --frozen-lockfile --no-strict-peer-dependencies --loglevel verbose

EXPOSE 3000

CMD ["node", "dist/main.js"]
