'use client';

import { ReactNode, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';

// Need to manually import Leaflet CSS here since it's used in a client component
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
// Use a self-invoking function to setup the icons immediately
// This avoids using useEffect outside of a component
(function setupLeafletIcons() {
  // Only run on the client side
  if (typeof window !== 'undefined') {
    // This code fixes the broken Leaflet marker icons in production
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
})();

// Export all components for use in other files
export { MapContainer, TileLayer, Marker, useMap, Popup, L };

// Default export is a wrapper component
export default function LeafletComponents({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}