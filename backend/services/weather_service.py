import os
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# API configuration
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5"

def get_weather_data(lat, lon):
    """
    Get current weather data for a specific location.
    
    Args:
        lat: Latitude of the location
        lon: Longitude of the location
        
    Returns:
        dict: Weather data for the location
    """
    try:
        url = f"{BASE_URL}/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"  # Use metric units
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract relevant weather information
        weather_data = {
            "location": {
                "name": data.get("name", "Unknown"),
                "country": data.get("sys", {}).get("country", ""),
                "lat": data.get("coord", {}).get("lat"),
                "lon": data.get("coord", {}).get("lon")
            },
            "current": {
                "temp": data.get("main", {}).get("temp"),
                "feels_like": data.get("main", {}).get("feels_like"),
                "temp_min": data.get("main", {}).get("temp_min"),
                "temp_max": data.get("main", {}).get("temp_max"),
                "humidity": data.get("main", {}).get("humidity"),
                "pressure": data.get("main", {}).get("pressure"),
                "wind_speed": data.get("wind", {}).get("speed"),
                "wind_direction": data.get("wind", {}).get("deg"),
                "clouds": data.get("clouds", {}).get("all"),
                "weather": {
                    "main": data.get("weather", [{}])[0].get("main"),
                    "description": data.get("weather", [{}])[0].get("description"),
                    "icon": data.get("weather", [{}])[0].get("icon")
                },
                "visibility": data.get("visibility"),
                "datetime": data.get("dt")
            }
        }
        
        return weather_data
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching weather data: {str(e)}")
        raise Exception(f"Failed to fetch weather data: {str(e)}")

def get_weather_forecast(lat, lon):
    """
    Get 5-day weather forecast for a specific location.
    
    Args:
        lat: Latitude of the location
        lon: Longitude of the location
        
    Returns:
        dict: Forecast data for the location
    """
    try:
        url = f"{BASE_URL}/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"  # Use metric units
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Process and format forecast data
        forecast_items = []
        for item in data.get("list", []):
            forecast_items.append({
                "datetime": item.get("dt"),
                "temp": item.get("main", {}).get("temp"),
                "feels_like": item.get("main", {}).get("feels_like"),
                "temp_min": item.get("main", {}).get("temp_min"),
                "temp_max": item.get("main", {}).get("temp_max"),
                "humidity": item.get("main", {}).get("humidity"),
                "pressure": item.get("main", {}).get("pressure"),
                "weather": {
                    "main": item.get("weather", [{}])[0].get("main"),
                    "description": item.get("weather", [{}])[0].get("description"),
                    "icon": item.get("weather", [{}])[0].get("icon")
                },
                "wind_speed": item.get("wind", {}).get("speed"),
                "wind_direction": item.get("wind", {}).get("deg"),
                "clouds": item.get("clouds", {}).get("all"),
                "precipitation_prob": item.get("pop", 0)
            })
        
        forecast_data = {
            "location": {
                "name": data.get("city", {}).get("name", "Unknown"),
                "country": data.get("city", {}).get("country", ""),
                "lat": data.get("city", {}).get("coord", {}).get("lat"),
                "lon": data.get("city", {}).get("coord", {}).get("lon")
            },
            "forecast": forecast_items
        }
        
        return forecast_data
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching forecast data: {str(e)}")
        raise Exception(f"Failed to fetch forecast data: {str(e)}")

def get_heatmap_data(data_type='temperature', bounds=None):
    """
    Get weather data for a heatmap visualization.
    
    Args:
        data_type: Type of weather data (temperature, precipitation, humidity, etc.)
        bounds: Map bounds (north, south, east, west)
        
    Returns:
        list: Weather data points for the heatmap
    """
    try:
        # Default bounds if not provided
        if not bounds:
            bounds = {
                'north': 60,
                'south': 20,
                'east': -60,
                'west': -130
            }
        
        # Calculate grid points based on bounds
        lat_step = 2.0
        lon_step = 2.0
        
        lat_points = int((bounds['north'] - bounds['south']) / lat_step) + 1
        lon_points = int((bounds['east'] - bounds['west']) / lon_step) + 1
        
        # Limit the number of API calls to avoid rate limits
        if lat_points * lon_points > 80:
            lat_step = (bounds['north'] - bounds['south']) / 8
            lon_step = (bounds['east'] - bounds['west']) / 10
            lat_points = int((bounds['north'] - bounds['south']) / lat_step) + 1
            lon_points = int((bounds['east'] - bounds['west']) / lon_step) + 1
        
        # Use OpenWeatherMap's box endpoint for more efficient fetching
        url = "https://api.openweathermap.org/data/2.5/box/city"
        params = {
            "bbox": f"{bounds['west']},{bounds['south']},{bounds['east']},{bounds['north']},10",
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Process data for heatmap
        heatmap_data = []
        
        for city in data.get("list", []):
            value = None
            
            if data_type == 'temperature':
                value = city.get("main", {}).get("temp")
            elif data_type == 'precipitation':
                # Approximate precipitation from clouds and weather conditions
                clouds = city.get("clouds", {}).get("all", 0)
                weather_id = city.get("weather", [{}])[0].get("id", 800)
                
                # Weather codes 200-531 are precipitation conditions
                has_precipitation = 200 <= weather_id <= 531
                
                value = (clouds / 100) * (1 if has_precipitation else 0.1)
            elif data_type == 'humidity':
                value = city.get("main", {}).get("humidity")
            elif data_type == 'pressure':
                value = city.get("main", {}).get("pressure")
            
            if value is not None:
                # Create heatmap data point [lat, lng, intensity]
                lat = city.get("coord", {}).get("lat")
                lon = city.get("coord", {}).get("lon")
                
                if lat is not None and lon is not None:
                    # Normalize the value based on data type
                    if data_type == 'temperature':
                        # Normalize temperature to a range of 0-1
                        # Assuming temp range from -20 to 40 degrees Celsius
                        normalized_value = (value + 20) / 60
                        intensity = max(0, min(1, normalized_value))
                    elif data_type == 'precipitation':
                        intensity = value  # Already normalized
                    elif data_type == 'humidity':
                        intensity = value / 100  # 0-100 to 0-1
                    elif data_type == 'pressure':
                        # Normalize pressure around 1013.25 hPa (standard pressure)
                        normalized_value = (value - 950) / 150
                        intensity = max(0, min(1, normalized_value))
                    else:
                        intensity = 0.5  # Default intensity
                    
                    heatmap_data.append([lat, lon, intensity])
        
        return heatmap_data
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching heatmap data: {str(e)}")
        raise Exception(f"Failed to fetch heatmap data: {str(e)}")