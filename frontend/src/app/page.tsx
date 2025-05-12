'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WeatherMap from '@/components/WeatherMap';
import CurrentWeather from '@/components/CurrentWeather';
import WeatherForecast from '@/components/WeatherForecast';
import WeatherDescription from '@/components/WeatherDescription';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lon: number;
    name?: string;
  } | null>(null);

  // Handle location selection from map
  const handleMapLocationSelect = (lat: number, lon: number) => {
    setSelectedLocation({ lat, lon });
  };

  // Handle location selection from search
  const handleSearchLocationSelect = (lat: number, lon: number, name: string) => {
    setSelectedLocation({ lat, lon, name });
  };

  return (
    <>
      <Header onLocationSelect={handleSearchLocationSelect} />
      
      <main className="py-4">
        <div className="container">
          {/* Error Container */}
          <div id="error-container" className="mb-4"></div>
          
          {/* Map Section */}
          <section className="mb-4">
            <WeatherMap 
              onLocationSelect={handleMapLocationSelect}
              selectedLocation={selectedLocation ? { 
                lat: selectedLocation.lat, 
                lon: selectedLocation.lon 
              } : undefined}
            />
          </section>
          
          {selectedLocation ? (
            <section className="row">
              {/* Current Weather */}
              <div className="col-md-6 mb-4">
                <CurrentWeather 
                  lat={selectedLocation.lat} 
                  lon={selectedLocation.lon} 
                />
              </div>
              
              {/* AI Description */}
              <div className="col-md-6 mb-4">
                <WeatherDescription 
                  lat={selectedLocation.lat} 
                  lon={selectedLocation.lon} 
                />
              </div>
              
              {/* Forecast */}
              <div className="col-12 mb-4">
                <WeatherForecast 
                  lat={selectedLocation.lat} 
                  lon={selectedLocation.lon} 
                />
              </div>
            </section>
          ) : (
            <section className="row">
              {/* Placeholder Content */}
              <div className="col-md-6 mb-4">
                <div className="card weather-card bg-dark text-light">
                  <div className="card-body text-center py-5">
                    <i className="fas fa-map-pin fa-2x mb-3 text-info"></i>
                    <h3>Click on the map or search for a location</h3>
                    <p className="text-light">Weather information will be displayed here</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card weather-card bg-dark text-light">
                  <div className="card-body text-center py-5">
                    <i className="fas fa-robot fa-2x mb-3 text-info"></i>
                    <h3>AI Weather Insights</h3>
                    <p className="text-light">Select a location to get AI-powered weather description</p>
                  </div>
                </div>
              </div>
              
              <div className="col-12 mb-4">
                <div className="card weather-card bg-dark text-light">
                  <div className="card-body text-center py-5">
                    <i className="fas fa-calendar-alt fa-2x mb-3 text-info"></i>
                    <h3>Weather Forecast</h3>
                    <p className="text-light">Select a location to view the forecast</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}