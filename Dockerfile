# Stage 1: Build frontend
FROM node:14 AS frontend

WORKDIR /app

# Copy frontend source files
COPY securefiles-frontend/package.json securefiles-frontend/package-lock.json ./
RUN npm install redux react-redux redux-thunk axios web-vitals
COPY securefiles-frontend/ ./
RUN npm start

# Stage 2: Setup backend
FROM python:3.9-slim AS backend

WORKDIR /app

# Install backend dependencies
COPY securefiles/requirements.txt ./
RUN pip3 install -r requirements.txt

# Copy backend source files
COPY securefiles/ .

# Stage 3: Final stage
FROM python:3.9-slim

WORKDIR /app

# Copy backend from the builder stage
COPY --from=backend /app /app

# Copy frontend source files
COPY --from=frontend /app /app/frontend

# Expose the ports for the backend and frontend
EXPOSE 8000
EXPOSE 3000

# Start both frontend and backend servers
CMD ["sh", "-c", "cd /app/frontend && npm start & cd /app && python3 manage.py runserver 0.0.0.0:8000"]
