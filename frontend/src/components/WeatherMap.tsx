'use client';

import { useEffect, useRef, useState } from 'react';
import LeafletMap from './LeafletMap';
import { MapContainer, TileLayer, Marker, useMap, L } from './LeafletComponents';

interface HeatmapData {
  lat: number;
  lng: number;
  value: number;
}

interface WeatherMapProps {
  onLocationSelect: (lat: number, lon: number) => void;
  selectedLocation?: {
    lat: number;
    lon: number;
  };
}

// HeatMapLayer component for react-leaflet integration
const HeatMapLayer = ({ data, options }: { data: any[], options: any }) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !window.L || !window.L.heatLayer) {
      // Load Leaflet-heat script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        if (heatLayerRef.current) {
          map.removeLayer(heatLayerRef.current);
        }
        
        // @ts-ignore - L.heatLayer is added by the loaded script
        heatLayerRef.current = L.heatLayer(data, options).addTo(map);
      };
      
      return () => {
        document.body.removeChild(script);
      };
    } else {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
      
      // @ts-ignore - L.heatLayer is added by the loaded script
      heatLayerRef.current = L.heatLayer(data, options).addTo(map);
    }
    
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, data, options]);

  return null;
};

// HeatmapControls component
const HeatmapControls = ({ onTypeChange, currentType }: { onTypeChange: (type: string) => void, currentType: string }) => {
  const map = useMap();
  
  useEffect(() => {
    // Create control container
    const controlDiv = L.DomUtil.create('div', 'heatmap-controls');
    
    // Create buttons
    controlDiv.innerHTML = `
      <div class="btn-group" role="group" aria-label="Heatmap type">
        <button type="button" id="heatmap-temperature" class="btn btn-sm btn-primary heatmap-type-btn ${currentType === 'temperature' ? 'active' : ''}">Temperature</button>
        <button type="button" id="heatmap-precipitation" class="btn btn-sm btn-primary heatmap-type-btn ${currentType === 'precipitation' ? 'active' : ''}">Precipitation</button>
        <button type="button" id="heatmap-humidity" class="btn btn-sm btn-primary heatmap-type-btn ${currentType === 'humidity' ? 'active' : ''}">Humidity</button>
        <button type="button" id="heatmap-pressure" class="btn btn-sm btn-primary heatmap-type-btn ${currentType === 'pressure' ? 'active' : ''}">Pressure</button>
      </div>
    `;
    
    // Prevent click events from propagating to the map
    L.DomEvent.disableClickPropagation(controlDiv);
    
    // Create custom control
    const control = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function() {
        return controlDiv;
      }
    });
    
    // Add control to map
    new control().addTo(map);
    
    // Add click event listeners
    document.getElementById('heatmap-temperature')?.addEventListener('click', () => onTypeChange('temperature'));
    document.getElementById('heatmap-precipitation')?.addEventListener('click', () => onTypeChange('precipitation'));
    document.getElementById('heatmap-humidity')?.addEventListener('click', () => onTypeChange('humidity'));
    document.getElementById('heatmap-pressure')?.addEventListener('click', () => onTypeChange('pressure'));
    
    // Cleanup on unmount
    return () => {
      document.getElementById('heatmap-temperature')?.removeEventListener('click', () => onTypeChange('temperature'));
      document.getElementById('heatmap-precipitation')?.removeEventListener('click', () => onTypeChange('precipitation'));
      document.getElementById('heatmap-humidity')?.removeEventListener('click', () => onTypeChange('humidity'));
      document.getElementById('heatmap-pressure')?.removeEventListener('click', () => onTypeChange('pressure'));
    };
  }, [map, currentType, onTypeChange]);

  return null;
};

// Main WeatherMap component
const WeatherMap: React.FC<WeatherMapProps> = ({ onLocationSelect, selectedLocation }) => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [heatmapType, setHeatmapType] = useState<string>('temperature');
  const [loading, setLoading] = useState<boolean>(false);
  const mapRef = useRef<any>(null);

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

  // Map click handler
  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    onLocationSelect(lat, lng);
  };

  // Handle map movement/zoom
  const MapEvents = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
      
      const handleMoveEnd = () => {
        if (map.getZoom() < 7) {
          updateHeatmap(map.getBounds());
        }
      };
      
      const handleZoomEnd = () => {
        updateHeatmap(map.getBounds());
      };
      
      // Initial heatmap update
      updateHeatmap(map.getBounds());
      
      // Add event listeners
      map.on('moveend', handleMoveEnd);
      map.on('zoomend', handleZoomEnd);
      map.on('click', handleMapClick);
      
      // Cleanup
      return () => {
        map.off('moveend', handleMoveEnd);
        map.off('zoomend', handleZoomEnd);
        map.off('click', handleMapClick);
      };
    }, [map]);
    
    return null;
  };

  // Handle heatmap type change
  const handleHeatmapTypeChange = (type: string) => {
    setHeatmapType(type);
    if (mapRef.current) {
      updateHeatmap(mapRef.current.getBounds());
    }
  };

  // Render client-side only
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
          <MapContainer
            center={[40, -95]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatMapLayer
              data={heatmapData}
              options={{
                radius: 25,
                blur: 15,
                maxZoom: 10,
                gradient: getHeatmapGradient(heatmapType)
              }}
            />
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lon]} />
            )}
            <HeatmapControls onTypeChange={handleHeatmapTypeChange} currentType={heatmapType} />
            <MapEvents />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default WeatherMap;