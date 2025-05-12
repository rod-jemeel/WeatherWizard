'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Import Chart.js directly for client-side rendering
import Chart from 'chart.js/auto';

// Add proper Chart.js categories for TypeScript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    clouds: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    visibility: number;
    datetime: number;
  };
}

interface CurrentWeatherProps {
  lat: number;
  lon: number;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ lat, lon }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Failed to load weather data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [lat, lon]);

  // Create temperature chart
  useEffect(() => {
    if (!weatherData || !document.getElementById('temperature-chart')) return;
    
    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = document.getElementById('temperature-chart') as HTMLCanvasElement;
    if (!ctx) return;

    // Create chart data
    const data = {
      labels: ['Current', 'Feels Like', 'Min', 'Max'],
      datasets: [{
        label: 'Temperature (°C)',
        data: [
          weatherData.current.temp,
          weatherData.current.feels_like,
          weatherData.current.temp_min,
          weatherData.current.temp_max
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    // Chart configuration
    const config = {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: ${context.raw}°C`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    };
    
    // Create chart
    chartRef.current = new Chart(ctx, config as any);

    // Cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [weatherData]);

  if (loading) {
    return (
      <div className="card weather-card bg-dark text-light">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="card weather-card bg-dark text-light">
        <div className="card-body text-center py-5">
          <i className="fas fa-exclamation-circle fa-2x mb-3 text-danger"></i>
          <h3>Error</h3>
          <p className="text-light">{error || 'Failed to load weather data'}</p>
        </div>
      </div>
    );
  }

  const iconCode = weatherData.current.weather.icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
  const temp = Math.round(weatherData.current.temp);
  const feelsLike = Math.round(weatherData.current.feels_like);

  return (
    <div className="card weather-card bg-dark text-light">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>{weatherData.location.name}, {weatherData.location.country}</h2>
            <p className="mb-0">{new Date(weatherData.current.datetime * 1000).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <img src={iconUrl} alt={weatherData.current.weather.description} className="weather-icon" />
            <p className="text-capitalize mb-0">{weatherData.current.weather.description}</p>
          </div>
        </div>
        
        <div className="row mt-4">
          <div className="col-md-6">
            <h3 className="display-4">{temp}°C</h3>
            <p>Feels like {feelsLike}°C</p>
          </div>
          <div className="col-md-6">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between">
                <span>Humidity</span>
                <span>{weatherData.current.humidity}%</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Wind</span>
                <span>{weatherData.current.wind_speed} m/s</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Pressure</span>
                <span>{weatherData.current.pressure} hPa</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Visibility</span>
                <span>{(weatherData.current.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 chart-container">
          <canvas id="temperature-chart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;