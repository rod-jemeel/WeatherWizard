'use client';

// This is a wrapper component that dynamically imports the Leaflet map
// Using a separate file ensures clean code organization and better performance

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Import the entire react-leaflet library at once, avoiding multiple dynamic imports
const LeafletComponents = dynamic(
  () => import('./LeafletComponents'),
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

interface LeafletMapProps {
  children?: ReactNode;
}

export default function LeafletMap({ children }: LeafletMapProps) {
  return <LeafletComponents>{children}</LeafletComponents>;
}