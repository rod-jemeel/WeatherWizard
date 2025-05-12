# Weather App with AI Integration

A comprehensive weather application that combines interactive data visualization, AI-powered insights, and user-friendly design.

## Features

- Real-time weather data display with OpenWeatherMap API
- Interactive weather maps with heatmap visualization
- AI-powered weather descriptions using OpenAI's GPT-4o model
- Detailed weather forecasts with charts
- Search functionality for global locations
- Responsive design for all devices

## Technology Stack

### Backend
- Python 3.9+
- Flask
- Flask-CORS for cross-origin resource sharing
- Flask-Caching for optimized performance
- OpenAI API for intelligent weather descriptions
- Pytest for automated testing

### Frontend
- Next.js 14
- React 18
- TypeScript
- Leaflet for interactive maps
- Chart.js for data visualization
- Bootstrap for responsive design
- Jest for component testing

## Project Structure

```
weather-app/
├── backend/            # Flask backend
│   ├── services/       # Service modules
│   ├── tests/          # Backend tests
│   ├── app.py          # Flask application
│   ├── main.py         # Entry point
│   └── requirements.txt # Python dependencies
├── frontend/           # Next.js frontend
│   ├── public/         # Static files
│   ├── src/            # React components
│   │   ├── app/        # Next.js app directory
│   │   ├── components/ # React components
│   ├── package.json    # Node dependencies
│   └── next.config.js  # Next.js configuration
├── render.yaml         # Render deployment configuration
└── README.md           # Project documentation
```

## Environment Variables

### Backend (`.env` file)
```
# API Keys
OPENAI_API_KEY=your-openai-api-key
OPENWEATHER_API_KEY=your-openweather-api-key

# Security
SESSION_SECRET=your-secret-key

# Deployment
FLASK_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local` file)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- API keys for OpenWeatherMap and OpenAI

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API keys

# Start the development server
python main.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file with your configuration

# Start the development server
npm run dev
```

## Running Tests

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend (Render)
1. Push your code to a GitHub repository
2. Create a new Web Service on Render
3. Connect to your GitHub repository
4. Render will automatically detect the Python application
5. Set the build command to `pip install -r backend/requirements.txt`
6. Set the start command to `cd backend && gunicorn --bind 0.0.0.0:$PORT main:app`
7. Add your environment variables (API keys, etc.)

### Frontend (Vercel)
1. Push your code to a GitHub repository
2. Create a new project on Vercel
3. Connect to your GitHub repository
4. Select the frontend directory as the root
5. Vercel will automatically detect the Next.js project
6. Add your environment variables in the Vercel project settings
7. Deploy

## License

MIT