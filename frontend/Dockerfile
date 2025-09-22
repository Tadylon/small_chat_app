# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the Vue app
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Expose port
EXPOSE 8080

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "8080"]