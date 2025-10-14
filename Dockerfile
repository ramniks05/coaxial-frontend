# Multi-stage build for optimized production image

# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build argument for API URL (with default production URL)
ARG REACT_APP_API_BASE_URL=https://coaxial-backend-production.up.railway.app
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Verify the API URL being used
RUN echo "Building with API URL: $REACT_APP_API_BASE_URL"

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set default PORT if not provided
ENV PORT=8080

# Expose the port
EXPOSE $PORT

# Start nginx (it will use envsubst on templates automatically)
CMD ["nginx", "-g", "daemon off;"]

