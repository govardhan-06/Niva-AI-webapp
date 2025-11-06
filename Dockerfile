# Multi-stage build for production
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API base URL
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1

# Set environment variable for build time
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy your custom nginx.conf (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates (optional: if they exist locally in certs/ folder)
# If certs are on EC2 (via certbot), mount them in docker-compose instead of copying
# COPY certs /etc/letsencrypt/live/nivaai.qulander.com/

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]

