import { NextRequest, NextResponse } from 'next/server';
import { getHeatmapData } from '@/utils/weather-service';
import cache from '@/utils/cache';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'temperature';
    const north = parseFloat(searchParams.get('north') || '0');
    const south = parseFloat(searchParams.get('south') || '0');
    const east = parseFloat(searchParams.get('east') || '0');
    const west = parseFloat(searchParams.get('west') || '0');
    
    if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
      return NextResponse.json(
        { error: 'Valid map bounds (north, south, east, west) are required' },
        { status: 400 }
      );
    }
    
    // Create a more relaxed cache key (rounded to 1 decimal place) since heatmap data
    // doesn't need to be as precise as point-based weather data
    const cacheKey = `heatmap_${type}_${north.toFixed(1)}_${south.toFixed(1)}_${east.toFixed(1)}_${west.toFixed(1)}`;
    
    // Check if we have cached data
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch fresh data
    const heatmapData = await getHeatmapData(type, { north, south, east, west });
    
    // Cache the result
    cache.set(cacheKey, heatmapData);
    
    return NextResponse.json(heatmapData);
  } catch (error) {
    console.error('Heatmap API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate heatmap data' },
      { status: 500 }
    );
  }
}
