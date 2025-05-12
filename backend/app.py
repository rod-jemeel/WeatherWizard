import os
import logging
from flask import Flask, jsonify, request
from flask_caching import Cache
from flask_cors import CORS
from services.weather_service import get_weather_data, get_weather_forecast, get_heatmap_data
from services.ai_service import generate_weather_description

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Enable CORS
CORS(app)

# Configure caching
cache = Cache(app, config={
    'CACHE_TYPE': 'SimpleCache',
    'CACHE_DEFAULT_TIMEOUT': 300  # 5 minutes
})

@app.route('/api/weather', methods=['GET'])
@cache.cached(timeout=300, query_string=True)
def weather():
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        if not lat or not lon:
            return jsonify({"error": "Latitude and longitude are required"}), 400
        
        weather_data = get_weather_data(lat, lon)
        return jsonify(weather_data)
    except Exception as e:
        logger.error(f"Error fetching weather data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/forecast', methods=['GET'])
@cache.cached(timeout=300, query_string=True)
def forecast():
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        if not lat or not lon:
            return jsonify({"error": "Latitude and longitude are required"}), 400
        
        forecast_data = get_weather_forecast(lat, lon)
        return jsonify(forecast_data)
    except Exception as e:
        logger.error(f"Error fetching forecast data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/heatmap', methods=['GET'])
@cache.cached(timeout=600)  # 10 minutes
def heatmap():
    try:
        type_param = request.args.get('type', 'temperature')
        bounds = {
            'north': float(request.args.get('north', 60)),
            'south': float(request.args.get('south', 20)),
            'east': float(request.args.get('east', -60)),
            'west': float(request.args.get('west', -130))
        }
        
        heatmap_data = get_heatmap_data(type_param, bounds)
        return jsonify(heatmap_data)
    except Exception as e:
        logger.error(f"Error fetching heatmap data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/weather_description', methods=['GET'])
def weather_description():
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        if not lat or not lon:
            return jsonify({"error": "Latitude and longitude are required"}), 400
        
        weather_data = get_weather_data(lat, lon)
        description = generate_weather_description(weather_data)
        return jsonify({"description": description})
    except Exception as e:
        logger.error(f"Error generating weather description: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)