// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia which Next.js uses to determine device characteristics
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for leaflet
jest.mock('leaflet', () => {
  return {
    map: jest.fn(),
    marker: jest.fn(),
    tileLayer: jest.fn(),
    control: {
      layers: jest.fn()
    },
    heatLayer: jest.fn(),
    DomUtil: {
      create: jest.fn()
    },
    DomEvent: {
      disableClickPropagation: jest.fn()
    },
    Control: {
      extend: jest.fn().mockReturnValue(
        class {
          constructor() {}
          addTo() { return this; }
        }
      )
    },
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: jest.fn()
      }
    }
  };
});

// Mock for react-leaflet
jest.mock('react-leaflet', () => {
  return {
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: () => <div data-testid="marker" />,
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
    useMap: jest.fn().mockReturnValue({
      getZoom: jest.fn().mockReturnValue(10),
      getBounds: jest.fn().mockReturnValue({
        getNorth: jest.fn().mockReturnValue(40),
        getSouth: jest.fn().mockReturnValue(30),
        getEast: jest.fn().mockReturnValue(-80),
        getWest: jest.fn().mockReturnValue(-90)
      }),
      on: jest.fn(),
      off: jest.fn(),
      removeLayer: jest.fn()
    })
  };
});