# Fridge Tracker

A web application for tracking items in your fridge, helping you reduce food waste and manage your groceries efficiently.

🔗 **Live Demo**: [https://fridge-tracker.brkovic.dev](https://fridge-tracker.brkovic.dev)

## Features

- Track items in your fridge
- Monitor expiration dates
- Manage grocery inventory
- User-friendly interface

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized setup)

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

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Docker Setup

1. Make sure Docker and Docker Compose are installed on your system

2. Build and run the containers:
   ```bash
   docker-compose up -d
   ```

3. The application will be available at `http://localhost:3000`

To stop the containers:
```bash
docker-compose down
```