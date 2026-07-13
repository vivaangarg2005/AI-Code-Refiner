# Single-stage build (production)
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies and install
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source code
COPY backend/server.js ./backend/

# Copy the pre-built frontend from the local dist folder
COPY frontend/dist ./frontend/dist

# Set port environment and expose it
ENV PORT=8080
EXPOSE 8080

# Start the server
WORKDIR /app/backend
CMD ["node", "server.js"]
