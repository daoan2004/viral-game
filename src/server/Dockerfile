# --- Stage 1: Build React Client ---
FROM node:20-alpine AS client-build
WORKDIR /usr/src/app

# Create directory structure to match local relative paths if needed, 
# but simpler to just build isolated and copy.

# Copy client package files
COPY src/client/package*.json ./src/client/
WORKDIR /usr/src/app/src/client
RUN npm install --legacy-peer-deps

# Copy client source
COPY src/client/ ./

# Set env var for build output location
ENV VITE_OUT_DIR=dist
RUN npm run build

# --- Stage 2: Build NestJS Server ---
FROM node:20-alpine AS server-build
WORKDIR /usr/src/app

# Copy server package files
COPY src/server/package*.json ./src/server/
WORKDIR /usr/src/app/src/server
RUN npm install --legacy-peer-deps

# Copy server source
COPY src/server/ ./

# Build server
RUN npm run build

# --- Stage 3: Production Image ---
FROM node:20-alpine AS production
WORKDIR /usr/src/app

# Install production dependencies for server
COPY src/server/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy server build
COPY --from=server-build /usr/src/app/src/server/dist ./dist

# Copy client build to public directory served by NestJS
# NestJS Static Serve Root: join(__dirname, '..', 'public') -> dist/../public -> public
COPY --from=client-build /usr/src/app/src/client/dist ./public

# Environment variables setup
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/main"]
