# Weather Wizard with Integrated AI

A comprehensive weather application that combines interactive data visualization, AI-powered insights, and user-friendly design, all in a simplified deployment architecture.

## Features

- Real-time weather data display with OpenWeatherMap API
- Interactive weather maps with heatmap visualization
- AI-powered weather descriptions using LangChain and OpenAI's GPT-4o model
- Detailed weather forecasts with charts
- Search functionality for global locations
- Responsive design for all devices

## Technology Stack

### Next.js Integrated Stack
- Next.js 14
- React 18
- TypeScript
- LangChain for AI integration
- OpenAI GPT-4o integration
- Node-Cache for API response caching
- Next.js API Routes for backend functionality
- Next.js Middleware for request handling

### Frontend
- Leaflet for interactive maps
- Chart.js for data visualization
- Bootstrap for responsive design
- Jest for component testing

## Project Structure

```
weather-wizard/
├── frontend/             # Next.js application
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── app/          # Next.js app directory
│   │   │   ├── api/      # API Routes
│   │   │   │   ├── forecast/         # Weather forecast API
│   │   │   │   ├── health/           # Health check API
│   │   │   │   ├── heatmap/          # Weather heatmap API
│   │   │   │   ├── weather/          # Current weather API
│   │   │   │   └── weather_description/ # AI weather description API
│   │   ├── components/   # React components
│   │   ├── utils/        # Utility functions
│   │   │   ├── ai-service.ts        # LangChain integration
│   │   │   ├── cache.ts             # Caching utility
│   │   │   ├── env.ts               # Environment config
│   │   │   └── weather-service.ts   # Weather data functions
│   │   └── middleware.ts # Request middleware
│   ├── package.json      # Node dependencies
│   └── next.config.js    # Next.js configuration
└── README.md             # Project documentation
```

## Advantages of This Architecture

1. **Simplified Deployment**: Single deployment on Vercel or similar platform
2. **Reduced Complexity**: No need for separate backend and frontend services
3. **Improved Performance**: Edge-optimized API routes and built-in caching
4. **Cost Efficiency**: Single hosting service instead of multiple services
5. **Easier Maintenance**: Consolidated codebase in one repository
6. **Streamlined Development**: Common language (TypeScript) for both frontend and backend

## Environment Variables

Create a `.env.local` file in the frontend directory with:

```
OPENWEATHER_API_KEY=your_openweather_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Development

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev
```

## Deployment

The project can be deployed directly to Vercel:

```bash
cd frontend
vercel
```

## Testing

```bash
# Run Jest tests
cd frontend
npm test
```

## License

MIT
