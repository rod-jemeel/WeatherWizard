'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Import types only (no code) for TypeScript
import type { LatLngBounds, LatLngExpression } from 'leaflet';

// Use a single dynamic import for the Map components
// This improves code quality and deployment reliability
const MapWithComponents = dynamic(
  () => import('./MapWithComponents'),
  { 
    ssr: false,
    loading: () => (
      <div className="map-container d-flex justify-content-center align-items-center bg-dark">
        <div className="text-center">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading map...</span>
          </div>
          <p className="mt-3 text-light">Loading map components...</p>
        </div>
      </div>
    )
  }
);

interface WeatherMapProps {
  onLocationSelect: (lat: number, lon: number) => void;
  selectedLocation?: {
    lat: number;
    lon: number;
  };
}

// Main WeatherMap component
const WeatherMap: React.FC<WeatherMapProps> = ({ onLocationSelect, selectedLocation }) => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [heatmapType, setHeatmapType] = useState<string>('temperature');
  const [loading, setLoading] = useState<boolean>(false);

  // Get heatmap gradient based on type
  const getHeatmapGradient = (type: string) => {
    switch (type) {
      case 'temperature':
        return {
          0.0: 'blue',
          0.3: 'cyan',
          0.5: 'lime',
          0.7: 'yellow',
          1.0: 'red'
        };
      case 'precipitation':
        return {
          0.0: 'rgba(0, 0, 255, 0)',
          0.2: 'rgba(0, 0, 255, 0.7)',
          0.4: 'rgba(0, 255, 255, 0.8)',
          0.6: 'rgba(0, 255, 0, 0.8)',
          0.8: 'rgba(255, 255, 0, 0.8)',
          1.0: 'rgba(255, 0, 0, 0.8)'
        };
      case 'humidity':
        return {
          0.0: 'rgba(255, 255, 0, 0.7)',
          0.5: 'rgba(0, 255, 0, 0.8)',
          0.8: 'rgba(0, 0, 255, 0.9)',
          1.0: 'rgba(128, 0, 128, 1)'
        };
      case 'pressure':
        return {
          0.0: 'purple',
          0.3: 'blue',
          0.5: 'green',
          0.7: 'yellow',
          1.0: 'red'
        };
      default:
        return {
          0.0: 'blue',
          0.3: 'cyan',
          0.5: 'lime',
          0.7: 'yellow',
          1.0: 'red'
        };
    }
  };

  // Update heatmap when map bounds change
  const updateHeatmap = async (bounds: any) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/heatmap?type=${heatmapType}&north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch heatmap data');
      }
      
      const data = await response.json();
      setHeatmapData(data);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle heatmap type change
  const handleHeatmapTypeChange = (type: string) => {
    setHeatmapType(type);
  };

  return (
    <div className="card bg-dark">
      <div className="card-body">
        <h2 className="card-title mb-3">
          <i className="fas fa-map-marker-alt me-2 text-danger"></i>
          Interactive Weather Map
        </h2>
        <p className="card-text text-light mb-4">
          Click anywhere on the map to see detailed weather information or use the search box above.
          Toggle between different heatmap layers using the buttons in the top-right corner of the map.
        </p>
        <div className="map-container">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner-container">
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 mb-0">Loading heatmap data...</p>
              </div>
            </div>
          )}
          <MapWithComponents 
            heatmapData={heatmapData}
            heatmapType={heatmapType}
            heatmapGradient={getHeatmapGradient(heatmapType)}
            onHeatmapTypeChange={handleHeatmapTypeChange}
            onBoundsChange={updateHeatmap}
            onLocationSelect={onLocationSelect}
            selectedLocation={selectedLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default WeatherMap;