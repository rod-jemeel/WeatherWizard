# Migration Guide: Flask to Next.js Integration

This guide helps you transition from the separate Flask backend to the integrated Next.js approach.

## 1. Environment Setup

1. Make sure you have all environment variables in `.env.local`:

```
OPENWEATHER_API_KEY=your_openweather_api_key
OPENAI_API_KEY=your_openai_api_key
```

2. Install the required packages:

```bash
cd frontend
npm install langchain @langchain/openai openai dotenv-flow node-cache
```

## 2. API Endpoint Migration

| Flask Endpoint | Next.js API Route |
|----------------|-------------------|
| `/api/weather` | `/api/weather` |
| `/api/forecast` | `/api/forecast` |
| `/api/heatmap` | `/api/heatmap` |
| `/api/weather_description` | `/api/weather_description` |
| `/api/health` | `/api/health` |

## 3. Testing the Integration

1. Start the Next.js development server:

```bash
cd frontend
npm run dev
```

2. Visit http://localhost:3000 to test the application
3. Check that all API endpoints are working:
   - http://localhost:3000/api/health
   - http://localhost:3000/api/weather?lat=40&lon=-74
   - http://localhost:3000/api/forecast?lat=40&lon=-74
   - http://localhost:3000/api/weather_description?lat=40&lon=-74

## 4. Deployment

Deploy only the frontend directory to Vercel:

```bash
cd frontend
vercel
```

## 5. Decommissioning the Flask Backend

After confirming that the integrated Next.js application works as expected:

1. Update DNS records if needed
2. Shut down the Flask backend deployment on Render or other platforms

## 6. Advantages of the New Architecture

1. **Simplified Deployment**: Single deployment target
2. **Cost Savings**: Only one platform to pay for
3. **Performance**: Edge network distribution for all API routes
4. **Maintenance**: Single codebase and language (TypeScript)
5. **Security**: Simplified security model with Next.js middleware
