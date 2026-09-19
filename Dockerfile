FROM node:22-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Expose standard port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
