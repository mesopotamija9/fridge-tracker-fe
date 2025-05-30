# Fridge Tracker

A modern web application for tracking items in your fridge, helping you reduce food waste and manage your groceries efficiently. Built with React and TypeScript for the frontend, backed by a Spring Boot backend.

🔗 **Live Demo**: [https://fridge-tracker.brkovic.dev](https://fridge-tracker.brkovic.dev)

## Features

- Track items in your fridge
- Monitor expiration dates
- Multiple fridges support
- Manage grocery inventory
- User-friendly interface
- User authentication and authorization
- RESTful API integration

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Docker (optional, for containerized setup)

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fridge-tracker-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:9000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Docker Setup

### Using Docker Directly

1. Build the Docker image:
   ```bash
   docker build -t fridge-tracker-fe .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:9000 fridge-tracker-fe
   ```

### Using Docker Compose

1. Start the containers:
   ```bash
   docker-compose up -d
   ```

2. The application will be available at `http://localhost:3000`

To stop the containers:
```bash
docker-compose down
```

## API Integration

The frontend application communicates with the Spring Boot backend API running at `http://localhost:9000`. Make sure the backend service is running and accessible before starting the frontend application.

The backend repository is available at: [https://github.com/mesopotamija9/fridge-tracker](https://github.com/mesopotamija9/fridge-tracker)

Please follow the instructions in the backend repository to set up and run the API service.
