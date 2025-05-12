import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/utils/weather-service';
import cache from '@/utils/cache';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');
    
    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required and must be valid numbers' },
        { status: 400 }
      );
    }
    
    // Generate a cache key
    const cacheKey = `weather_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    
    // Check if we have cached data
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch fresh data
    const weatherData = await getWeatherData(lat, lon);
    
    // Cache the result
    cache.set(cacheKey, weatherData);
    
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
