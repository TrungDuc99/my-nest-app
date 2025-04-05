# Stage 1: Build
FROM --platform=linux/amd64 node:18-alpine AS builder
WORKDIR /app

# Set environment variables to avoid prompts
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PATH:$PNPM_HOME
ENV CI=true

# Copy source code và install packages
COPY . .
RUN npm install -g pnpm && pnpm config set auto-install-peers true && pnpm install --frozen-lockfile && pnpm build

# Stage 2: Run app
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app

# Set environment variables to avoid prompts
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PATH:$PNPM_HOME
ENV CI=true

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm config set auto-install-peers true && pnpm install --prod --frozen-lockfile

CMD ["node", "dist/main.js"]
