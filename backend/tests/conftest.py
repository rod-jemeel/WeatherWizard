import os
import pytest
import json
from app import app as flask_app

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment variables."""
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['SESSION_SECRET'] = 'test-secret-key'
    # Ensure we have placeholder values for required API keys
    if 'OPENAI_API_KEY' not in os.environ:
        os.environ['OPENAI_API_KEY'] = 'test-openai-key'
    if 'OPENWEATHER_API_KEY' not in os.environ:
        os.environ['OPENWEATHER_API_KEY'] = 'test-openweather-key'
    yield
    # cleanup after tests if needed

@pytest.fixture
def app():
    """Create and configure the Flask app for testing."""
    # Disable caching for tests
    flask_app.config['CACHE_TYPE'] = 'null'
    return flask_app

@pytest.fixture
def client(app):
    """A test client for the Flask app."""
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_weather_data():
    """Sample weather data for testing."""
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

@pytest.fixture
def sample_forecast_data():
    """Sample forecast data for testing."""
    return {
        'location': {
            'name': 'New York',
            'country': 'US',
            'lat': 40.7128,
            'lon': -74.0060
        },
        'forecast': [
            {
                'datetime': 1628553600,
                'temp': 20,
                'feels_like': 18,
                'temp_min': 16,
                'temp_max': 22,
                'humidity': 65,
                'pressure': 1012,
                'weather': {
                    'main': 'Clear',
                    'description': 'clear sky',
                    'icon': '01d'
                },
                'wind_speed': 5,
                'wind_direction': 270,
                'clouds': 40,
                'precipitation_prob': 0.1
            },
            {
                'datetime': 1628564400,
                'temp': 18,
                'feels_like': 16,
                'temp_min': 15,
                'temp_max': 19,
                'humidity': 70,
                'pressure': 1010,
                'weather': {
                    'main': 'Clouds',
                    'description': 'few clouds',
                    'icon': '02n'
                },
                'wind_speed': 4,
                'wind_direction': 260,
                'clouds': 20,
                'precipitation_prob': 0.2
            }
        ]
    }