'use client';

import { useEffect, useState } from 'react';

interface WeatherDescriptionProps {
  lat: number;
  lon: number;
}

const WeatherDescription: React.FC<WeatherDescriptionProps> = ({ lat, lon }) => {
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherDescription = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/weather_description?lat=${lat}&lon=${lon}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather description');
        }
        
        const data = await response.json();
        setDescription(data.description);
      } catch (error) {
        console.error('Error fetching weather description:', error);
        setError('Failed to load AI weather description. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherDescription();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="card weather-card bg-dark text-light">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Generating AI weather insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card weather-card bg-dark text-light">
        <div className="card-body text-center py-5">
          <i className="fas fa-exclamation-circle fa-2x mb-3 text-danger"></i>
          <h3>Error</h3>
          <p className="text-light">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card weather-card bg-dark text-light">
      <div className="card-body">
        <h3 className="card-title">
          <i className="fas fa-robot me-2"></i>AI Weather Insights
        </h3>
        <p className="ai-description mt-3">{description}</p>
      </div>
    </div>
  );
};

export default WeatherDescription;