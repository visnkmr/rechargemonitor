# Stock API Service Setup

This directory contains a separate Express microservice to handle stock API calls, avoiding CORS issues while keeping the Next.js app as static export.

## Quick Start

```bash
# Start both services together
./start-services.sh

# Or start individually:
cd api-service && npm start
npm run dev  # In root directory
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   Next.js App  │    │  Express API     │
│   (Port 3000) │◄──►│  Service        │
│   Static Export │    │  (Port 3001)    │
└─────────────────┘    └──────────────────┘
        │                       │
        ▼                       ▼
   Browser requests         Screener.in APIs
   (localhost:3000)        (External)
```

## API Endpoints

### Stock Search
- **URL**: `GET http://localhost:3001/api/stocks/search?q={query}`
- **Example**: `http://localhost:3001/api/stocks/search?q=tcs`
- **Response**: Array of stock search results

### Stock Chart Data
- **URL**: `GET http://localhost:3001/api/stocks/{id}/chart`
- **Example**: `http://localhost:3001/api/stocks/3365/chart`
- **Response**: Historical price data with technical indicators

### Health Check
- **URL**: `GET http://localhost:3001/health`
- **Response**: Service status

## Features

- ✅ **CORS Enabled**: Allows requests from localhost:3000
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Logging**: Request/response logging
- ✅ **Timeout Protection**: Prevents hanging requests
- ✅ **Graceful Shutdown**: Handles SIGTERM/SIGINT

## Development

```bash
cd api-service
npm install
npm run dev  # Uses nodemon for auto-restart
```

## Production

```bash
cd api-service
npm start
```

## Environment Variables

- `PORT` - API service port (default: 3001)

## Integration with Next.js

The Next.js app automatically calls these endpoints instead of direct Screener.in APIs:

- Stock search: `http://localhost:3001/api/stocks/search?q=...`
- Chart data: `http://localhost:3001/api/stocks/{id}/chart`

This eliminates CORS issues and provides better error handling.