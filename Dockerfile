# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]
