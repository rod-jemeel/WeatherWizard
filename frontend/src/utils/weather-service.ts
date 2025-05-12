import { config } from './env';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getWeatherData(lat: number, lon: number) {
  try {
    const url = `${BASE_URL}/weather`;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: config.openWeatherApiKey,
      units: 'metric' // Use metric units
    });
    
    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract relevant weather information
    return {
      location: {
        name: data.name || 'Unknown',
        country: data.sys?.country || '',
        lat: data.coord?.lat,
        lon: data.coord?.lon
      },
      current: {
        temp: data.main?.temp,
        feels_like: data.main?.feels_like,
        temp_min: data.main?.temp_min,
        temp_max: data.main?.temp_max,
        humidity: data.main?.humidity,
        pressure: data.main?.pressure,
        wind_speed: data.wind?.speed,
        wind_deg: data.wind?.deg,
        clouds: data.clouds?.all,
        visibility: data.visibility,
        weather: {
          id: data.weather?.[0]?.id,
          main: data.weather?.[0]?.main,
          description: data.weather?.[0]?.description,
          icon: data.weather?.[0]?.icon
        },
        dt: data.dt * 1000 // Convert to milliseconds
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

export async function getWeatherForecast(lat: number, lon: number) {
  try {
    const url = `${BASE_URL}/forecast`;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: config.openWeatherApiKey,
      units: 'metric'
    });
    
    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const forecastData = {
      location: {
        name: data.city?.name || 'Unknown',
        country: data.city?.country || '',
        lat: data.city?.coord?.lat,
        lon: data.city?.coord?.lon
      },
      forecast: data.list?.map((item: any) => ({
        dt: item.dt * 1000, // Convert to milliseconds
        temp: item.main?.temp,
        feels_like: item.main?.feels_like,
        temp_min: item.main?.temp_min,
        temp_max: item.main?.temp_max,
        humidity: item.main?.humidity,
        pressure: item.main?.pressure,
        wind_speed: item.wind?.speed,
        wind_deg: item.wind?.deg,
        clouds: item.clouds?.all,
        weather: {
          id: item.weather?.[0]?.id,
          main: item.weather?.[0]?.main,
          description: item.weather?.[0]?.description,
          icon: item.weather?.[0]?.icon
        },
        dt_txt: item.dt_txt
      })) || []
    };
    
    return forecastData;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

export async function getHeatmapData(type: string, bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  try {
    // Get request parameters from bounds and type
    const { north, south, east, west } = bounds;
    
    // OpenWeatherMap has a grid data API, but it's not free - so we're simulating heatmap data
    // In a production app, you would use a real data source
    
    // Create a grid of lat/lon points within the bounds
    const gridSize = 20;
    const latStep = (north - south) / gridSize;
    const lonStep = (east - west) / gridSize;
    
    const heatmapData = [];
    
    // Generate sample data for visualization
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const lat = south + i * latStep;
        const lon = west + j * lonStep;
        
        // Add some randomness to make the heatmap interesting
        let intensity;
        
        switch (type) {
          case 'temperature':
            // Temperature decreases with latitude (gets colder toward poles)
            intensity = Math.max(0, 30 - Math.abs(lat - 0) * 1.5) + (Math.random() * 10 - 5);
            break;
          case 'precipitation':
            // Random precipitation with some patterns
            intensity = Math.random() * 30 * (Math.sin(lat / 10) + Math.cos(lon / 10) + 2) / 4;
            break;
          case 'humidity':
            // Humidity tends to be higher near coastlines and equator
            intensity = 40 + Math.random() * 40 * (Math.sin(lat / 15) + Math.cos(lon / 15) + 2) / 4;
            break;
          case 'pressure':
            // Pressure varies in bands
            intensity = 1000 + 20 * Math.sin(lat / 10) + Math.random() * 10;
            break;
          default:
            intensity = Math.random() * 30;
        }
        
        heatmapData.push([lat, lon, intensity]);
      }
    }
    
    return heatmapData;
  } catch (error) {
    console.error('Error generating heatmap data:', error);
    throw error;
  }
}
