import os
import json
import logging
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# OpenAI configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai = OpenAI(api_key=OPENAI_API_KEY)

def generate_weather_description(weather_data):
    """
    Generate an AI-powered description of the weather.
    
    Args:
        weather_data: Weather data for a location
        
    Returns:
        str: AI-generated weather description
    """
    try:
        # Extract relevant weather information for the prompt
        location_name = weather_data["location"]["name"]
        country = weather_data["location"]["country"]
        temp = weather_data["current"]["temp"]
        feels_like = weather_data["current"]["feels_like"]
        humidity = weather_data["current"]["humidity"]
        wind_speed = weather_data["current"]["wind_speed"]
        weather_main = weather_data["current"]["weather"]["main"]
        weather_desc = weather_data["current"]["weather"]["description"]
        
        # Create prompt for OpenAI
        prompt = f"""As a meteorologist, provide a helpful, informative, and conversational description of the current weather in {location_name}, {country}.
        
        Current conditions:
        - Temperature: {temp}°C (feels like {feels_like}°C)
        - Weather: {weather_main} ({weather_desc})
        - Humidity: {humidity}%
        - Wind Speed: {wind_speed} m/s
        
        Include:
        1. A brief summary of the current conditions
        2. How it feels outside (hot, cold, pleasant, etc.)
        3. Any relevant advice based on the weather (e.g., umbrella needed, sunscreen recommended)
        4. A brief comment on how this weather might affect outdoor activities
        
        Keep your response concise (3-4 sentences) and friendly. Do not include any data beyond what's provided.
        """
        
        # Call the OpenAI API
        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        # do not change this unless explicitly requested by the user
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful meteorologist providing weather insights."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7,
        )
        
        # Extract the generated description
        description = response.choices[0].message.content.strip()
        return description
    
    except Exception as e:
        logger.error(f"Error generating weather description with OpenAI: {str(e)}")
        # Fallback to a basic description if AI fails
        return generate_fallback_description(weather_data)

def generate_fallback_description(weather_data):
    """
    Generate a basic weather description without AI as a fallback.
    
    Args:
        weather_data: Weather data for a location
        
    Returns:
        str: Basic weather description
    """
    try:
        location_name = weather_data["location"]["name"]
        country = weather_data["location"]["country"]
        temp = weather_data["current"]["temp"]
        weather_desc = weather_data["current"]["weather"]["description"]
        
        description = f"Currently in {location_name}, {country}, it's {temp}°C with {weather_desc}."
        
        # Add advice based on weather conditions
        if temp < 5:
            description += " It's very cold, so bundle up with warm layers if you're heading outside."
        elif temp < 15:
            description += " It's cool, so a jacket would be recommended for outdoor activities."
        elif temp < 25:
            description += " The temperature is mild, good for most outdoor activities."
        else:
            description += " It's warm, ideal for outdoor activities but remember to stay hydrated."
        
        # Add advice based on weather conditions
        weather_main = weather_data["current"]["weather"]["main"].lower()
        if "rain" in weather_main:
            description += " Don't forget your umbrella!"
        elif "snow" in weather_main:
            description += " Be careful of slippery conditions if you're going out."
        elif "clear" in weather_main and temp > 20:
            description += " Sunscreen would be a good idea if you're spending time outside."
        
        return description
    
    except Exception as e:
        logger.error(f"Error generating fallback description: {str(e)}")
        return "Weather information is currently available. Please check the displayed data for details."