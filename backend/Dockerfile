# Use Node.js LTS version
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Create uploads directory
RUN mkdir -p uploads

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]