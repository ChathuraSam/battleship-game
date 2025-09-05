# Battleship Game Backend

This is the Node.js Express backend for the Battleship Game application.

## Features

- Express.js REST API
- TypeScript support
- CORS enabled for frontend communication
- Health check endpoints
- Game management API
- Development hot-reload with tsx

## API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health information

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run check-types
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

## Architecture

The backend is structured as follows:

- `src/index.ts` - Main application entry point
- `src/routes/` - API route handlers
  - `health.ts` - Health check routes
  - `game.ts` - Game management routes

This backend is designed to work with the Battleship Game frontend and can be extended with additional features like WebSocket support, database integration, authentication, and more sophisticated game logic.
