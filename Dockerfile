# Stage 1: Build the Vite React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Express Backend and serve the built frontend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source code
COPY backend/server.js ./backend/

# Copy the built frontend static files from the previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the backend port
EXPOSE 3000

# Start the server
WORKDIR /app/backend
CMD ["node", "server.js"]
