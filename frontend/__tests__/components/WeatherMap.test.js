import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WeatherMap from '../../src/components/WeatherMap';

// Mock dynamic import
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = ({ children, ...props }) => (
    <div data-testid="mocked-map-component" {...props}>
      {children}
    </div>
  );
  DynamicComponent.displayName = 'MockedDynamicComponent';
  return DynamicComponent;
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { lat: 40.7128, lng: -74.0060, value: 75 },
      { lat: 34.0522, lng: -118.2437, value: 85 }
    ])
  })
);

describe('WeatherMap Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the weather map with title and description', () => {
    const mockOnLocationSelect = jest.fn();
    render(<WeatherMap onLocationSelect={mockOnLocationSelect} />);
    
    // Check if the title is present
    expect(screen.getByText('Interactive Weather Map')).toBeInTheDocument();
    
    // Check for instructions text
    expect(screen.getByText(/Click anywhere on the map/i)).toBeInTheDocument();
    
    // Check for the dynamically loaded map component
    expect(screen.getByTestId('mocked-map-component')).toBeInTheDocument();
  });

  it('passes correct props to MapWithComponents', () => {
    const mockOnLocationSelect = jest.fn();
    const selectedLocation = { lat: 40.7128, lon: -74.0060 };
    
    render(
      <WeatherMap 
        onLocationSelect={mockOnLocationSelect} 
        selectedLocation={selectedLocation} 
      />
    );
    
    const mapComponent = screen.getByTestId('mocked-map-component');
    
    // Verify that props are passed correctly
    expect(mapComponent).toHaveAttribute('heatmapType', 'temperature');
    expect(mapComponent).toHaveAttribute('selectedLocation', JSON.stringify(selectedLocation));
    expect(mapComponent).toHaveAttribute('onLocationSelect', expect.any(String)); // Function is stringified
  });
});