# Weather App with Heatmaps & AI

A modern weather application featuring interactive heatmaps and AI-powered weather descriptions. The app is built with a Next.js frontend and Flask backend.

## Features

- **Real-time Weather Data**: Displays current weather conditions at any location
- **Interactive Heatmaps**: Visual representation of temperature, precipitation, humidity, and pressure
- **5-Day Forecast**: Detailed weather forecast with hourly predictions
- **AI-Powered Descriptions**: Natural language descriptions of weather conditions using OpenAI
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type-safe JavaScript
- **Leaflet** - Interactive maps with heatmap plugin
- **Chart.js** - Data visualization
- **Bootstrap** - Responsive UI components

### Backend
- **Flask** - Python web framework
- **OpenWeatherMap API** - Weather data source
- **OpenAI API** - AI-powered weather descriptions
- **Flask-Caching** - API response caching

## Project Structure

```
.
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   ├── public/             # Static assets
│   ├── next.config.js      # Next.js configuration
│   └── package.json        # Frontend dependencies
│
├── backend/                # Flask backend API
│   ├── services/           # Service modules
│   │   ├── weather_service.py  # Weather data handling
│   │   └── ai_service.py       # AI integration
│   ├── app.py              # Flask application
│   ├── main.py             # Entry point
│   └── requirements.txt    # Backend dependencies
```

## Setup and Installation

### Prerequisites
- Node.js 18.x or higher
- Python 3.11 or higher
- OpenWeatherMap API Key
- OpenAI API Key

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```
   OPENWEATHER_API_KEY=your_openweather_api_key
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_secret_key
   ```

5. Run the Flask application:
   ```
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. The application will be available at `http://localhost:3000`

## Deployment

### Backend Deployment
- The Flask backend can be deployed to any platform that supports Python applications (Heroku, AWS, DigitalOcean, etc.)
- Make sure to set the environment variables in your deployment environment

### Frontend Deployment
- The Next.js frontend can be deployed to Vercel, Netlify, or any other platform that supports Next.js
- Update the API endpoint in `next.config.js` to point to your deployed backend

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenWeatherMap for providing weather data
- OpenAI for the AI capabilities
- Leaflet and Chart.js for visualization components