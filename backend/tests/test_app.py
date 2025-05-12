import os
import json
import pytest
from app import app as flask_app

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    # Set test environment variables
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['SESSION_SECRET'] = 'test-secret-key'
    
    # Disable caching for tests
    flask_app.config['CACHE_TYPE'] = 'null'
    
    # Return app for testing
    return flask_app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'

def test_weather_endpoint_missing_params(client):
    """Test error handling for missing parameters."""
    response = client.get('/api/weather')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Latitude and longitude are required' in data['error']

def test_weather_endpoint_with_params(client, monkeypatch):
    """Test weather endpoint with mock data."""
    # This requires mocking the weather service calls
    # to avoid making actual API calls during tests
    from services.weather_service import get_weather_data
    
    # Mock data
    mock_weather_data = {
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
    
    # Create mock function
    def mock_get_weather_data(lat, lon):
        return mock_weather_data
    
    # Apply the monkeypatch for requests.get
    monkeypatch.setattr(
        "services.weather_service.get_weather_data", 
        mock_get_weather_data
    )
    
    # Make the request with test parameters
    response = client.get('/api/weather?lat=40.7128&lon=-74.0060')
    
    # Check the response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data == mock_weather_data