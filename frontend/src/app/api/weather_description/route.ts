import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/utils/weather-service';
import { generateWeatherDescription } from '@/utils/ai-service';
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
    const cacheKey = `weather_description_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    
    // Check if we have cached data
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({ description: cachedData });
    }
    
    // First, get weather data for the location
    const weatherData = await getWeatherData(lat, lon);
    
    // Then, generate a description using the AI service
    const description = await generateWeatherDescription(weatherData);
    
    // Cache the result
    cache.set(cacheKey, description, 600); // 10 minutes TTL for AI generated content
    
    return NextResponse.json({ description });
  } catch (error) {
    console.error('Weather description API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weather description' },
      { status: 500 }
    );
  }
}
