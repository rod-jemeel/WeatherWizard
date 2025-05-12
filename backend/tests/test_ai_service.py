import os
import pytest
from unittest.mock import patch, MagicMock
from services.ai_service import generate_weather_description, generate_fallback_description

# Sample weather data for testing
@pytest.fixture
def sample_weather_data():
    return {
        'location': {
            'name': 'New York',
            'country': 'US',
            'lat': 40.7128,
            'lon': -74.0060
        },
        'current': {
            'temp': 20,
            'feels_like': 18,
            'temp_min': 16,
            'temp_max': 22,
            'humidity': 65,
            'pressure': 1012,
            'wind_speed': 5,
            'wind_direction': 270,
            'clouds': 40,
            'weather': {
                'main': 'Clear',
                'description': 'clear sky',
                'icon': '01d'
            },
            'visibility': 10000,
            'datetime': 1628553600
        }
    }

def test_generate_fallback_description(sample_weather_data):
    """Test the fallback description generator."""
    description = generate_fallback_description(sample_weather_data)
    
    # Check that the description contains expected elements
    assert "New York" in description
    assert "US" in description
    assert "20°C" in description
    assert "clear sky" in description
    
    # Check for advice based on weather conditions
    assert "The temperature is mild" in description

@patch('services.ai_service.openai')
def test_generate_weather_description_success(mock_openai, sample_weather_data):
    """Test the AI-based weather description generator with successful API response."""
    # Set up the mock OpenAI client response
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "It's a beautiful day in New York with clear skies."
    mock_openai.chat.completions.create.return_value = mock_response
    
    # Call the function
    description = generate_weather_description(sample_weather_data)
    
    # Verify the result
    assert description == "It's a beautiful day in New York with clear skies."
    
    # Verify OpenAI was called with expected parameters
    mock_openai.chat.completions.create.assert_called_once()
    call_args = mock_openai.chat.completions.create.call_args[1]
    assert call_args['model'] == "gpt-4o"  # Check it's using the latest model
    assert call_args['max_tokens'] == 200
    assert len(call_args['messages']) == 2

@patch('services.ai_service.openai')
def test_generate_weather_description_api_error(mock_openai, sample_weather_data):
    """Test error handling in the weather description generator."""
    # Set up the mock to raise an exception
    mock_openai.chat.completions.create.side_effect = Exception("API Error")
    
    # Call the function - should not raise an exception
    description = generate_weather_description(sample_weather_data)
    
    # Verify it falls back to the basic description
    assert "New York" in description
    assert "US" in description
    assert "°C" in description