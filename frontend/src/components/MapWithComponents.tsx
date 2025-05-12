"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Set up Leaflet default marker icons
// This needs to be done before rendering any markers
if (typeof window !== "undefined") {
  (function setupLeafletIcons() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  })();
}

// Leaflet-heat implementation
interface HeatmapLayerProps {
  data: any[];
  options: any;
}

const HeatMapLayer: React.FC<HeatmapLayerProps> = ({ data, options }) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);
  useEffect(() => {
    // Dynamically load the heatmap script
    const loadHeatmapScript = async () => {
      // @ts-ignore - window.L.heatLayer is added by the dynamically loaded script
      if (!window.L.heatLayer) {
        // Create a script element to load the heatmap library
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load heatmap script"));
          document.head.appendChild(script);
        });
      }
      return Promise.resolve();
    };

    const initializeHeatmap = async () => {
      try {
        await loadHeatmapScript();
        // Remove previous heatmap layer if it exists
        if (heatLayerRef.current) {
          map.removeLayer(heatLayerRef.current);
        }
        // Create and add new heatmap layer
        // @ts-ignore - L.heatLayer is added by the dynamically loaded script
        heatLayerRef.current = L.heatLayer(data, options).addTo(map);
      } catch (error) {
        console.error("Error initializing heatmap:", error);
      }
    };

    initializeHeatmap();

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, data, options]);

  return null;
};

// Custom control for heatmap type selection
interface HeatmapControlsProps {
  onTypeChange: (type: string) => void;
  currentType: string;
}

const HeatmapControls: React.FC<HeatmapControlsProps> = ({
  onTypeChange,
  currentType,
}) => {
  const map = useMap();

  useEffect(() => {
    // Create custom control container
    const controlDiv = L.DomUtil.create("div", "heatmap-controls");

    // Set control content
    controlDiv.innerHTML = `
      <div class="btn-group" role="group" aria-label="Heatmap type">
        <button type="button" id="heatmap-temperature" class="btn btn-sm btn-primary heatmap-type-btn ${
          currentType === "temperature" ? "active" : ""
        }">Temperature</button>
        <button type="button" id="heatmap-precipitation" class="btn btn-sm btn-primary heatmap-type-btn ${
          currentType === "precipitation" ? "active" : ""
        }">Precipitation</button>
        <button type="button" id="heatmap-humidity" class="btn btn-sm btn-primary heatmap-type-btn ${
          currentType === "humidity" ? "active" : ""
        }">Humidity</button>
        <button type="button" id="heatmap-pressure" class="btn btn-sm btn-primary heatmap-type-btn ${
          currentType === "pressure" ? "active" : ""
        }">Pressure</button>
      </div>
    `;

    // Prevent click propagation
    L.DomEvent.disableClickPropagation(controlDiv);

    // Create and add control to map
    const control = L.Control.extend({
      options: { position: "topright" },
      onAdd: () => controlDiv,
    });

    new control().addTo(map);

    // Add event listeners
    const setupButtonListeners = () => {
      const buttons = {
        temperature: document.getElementById("heatmap-temperature"),
        precipitation: document.getElementById("heatmap-precipitation"),
        humidity: document.getElementById("heatmap-humidity"),
        pressure: document.getElementById("heatmap-pressure"),
      };

      Object.entries(buttons).forEach(([type, button]) => {
        if (button) {
          // Use a named function so we can remove it properly
          const clickHandler = () => onTypeChange(type);
          button.addEventListener("click", clickHandler);
        }
      });
    };

    setupButtonListeners();

    // No need for cleanup as the control is removed with the map
  }, [map, currentType, onTypeChange]);

  return null;
};

// Map events handler
interface MapEventsProps {
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onLocationSelect: (lat: number, lon: number) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({
  onBoundsChange,
  onLocationSelect,
}) => {
  const map = useMap();

  useEffect(() => {
    // Handler for map move events
    const handleMoveEnd = () => {
      if (map.getZoom() < 7) {
        onBoundsChange(map.getBounds());
      }
    };

    // Handler for zoom events
    const handleZoomEnd = () => {
      onBoundsChange(map.getBounds());
    };

    // Handler for click events
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    };

    // Initial heatmap update
    onBoundsChange(map.getBounds());

    // Add event listeners
    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleZoomEnd);
    map.on("click", handleClick);

    // Cleanup
    return () => {
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleZoomEnd);
      map.off("click", handleClick);
    };
  }, [map, onBoundsChange, onLocationSelect]);

  return null;
};

// Main map component with props
interface MapWithComponentsProps {
  heatmapData: any[];
  heatmapType: string;
  heatmapGradient: any;
  onHeatmapTypeChange: (type: string) => void;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onLocationSelect: (lat: number, lon: number) => void;
  selectedLocation?: {
    lat: number;
    lon: number;
  };
}

const MapWithComponents: React.FC<MapWithComponentsProps> = ({
  heatmapData,
  heatmapType,
  heatmapGradient,
  onHeatmapTypeChange,
  onBoundsChange,
  onLocationSelect,
  selectedLocation,
}) => {
  return (
    <MapContainer
      center={[40, -95]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
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
          gradient: heatmapGradient,
        }}
      />
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lon]} />
      )}
      <HeatmapControls
        onTypeChange={onHeatmapTypeChange}
        currentType={heatmapType}
      />
      <MapEvents
        onBoundsChange={onBoundsChange}
        onLocationSelect={onLocationSelect}
      />
    </MapContainer>
  );
};

export default MapWithComponents;
