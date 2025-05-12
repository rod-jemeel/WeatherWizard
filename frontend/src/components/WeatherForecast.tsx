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
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ForecastItem {
  datetime: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  wind_speed: number;
  wind_direction: number;
  clouds: number;
  precipitation_prob: number;
}

interface ForecastData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  forecast: ForecastItem[];
}

interface WeatherForecastProps {
  lat: number;
  lon: number;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ lat, lon }) => {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const fetchForecastData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch forecast data');
        }
        
        const data = await response.json();
        setForecastData(data);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
        setError('Failed to load forecast data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [lat, lon]);

  // Create forecast chart
  useEffect(() => {
    if (!forecastData || !document.getElementById('forecast-chart')) return;
    
    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = document.getElementById('forecast-chart') as HTMLCanvasElement;
    if (!ctx) return;

    // Process forecast data
    const forecastItems = forecastData.forecast.slice(0, 8);
    const timestamps: string[] = [];
    const temperatures: number[] = [];
    const feelsLike: number[] = [];
    const rainProbability: number[] = [];
    
    forecastItems.forEach(item => {
      // Convert timestamp to readable time
      const date = new Date(item.datetime * 1000);
      timestamps.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      // Get temperature and feels like values
      temperatures.push(item.temp);
      feelsLike.push(item.feels_like);
      
      // Get precipitation probability
      rainProbability.push(item.precipitation_prob * 100);
    });
    
    // Create chart data
    const data = {
      labels: timestamps,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y',
          tension: 0.3
        },
        {
          label: 'Feels Like (°C)',
          data: feelsLike,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y',
          tension: 0.3
        },
        {
          label: 'Precipitation Probability (%)',
          data: rainProbability,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'y1',
          tension: 0.3
        }
      ]
    };
    
    // Chart configuration
    const config = {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 2) {
                  label += context.raw + '%';
                } else {
                  label += context.raw + '°C';
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Temperature (°C)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Precipitation (%)'
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false
            }
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
  }, [forecastData]);

  if (loading) {
    return (
      <div className="card weather-card bg-dark text-light">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading forecast data...</p>
        </div>
      </div>
    );
  }

  if (error || !forecastData) {
    return (
      <div className="card weather-card bg-dark text-light">
        <div className="card-body text-center py-5">
          <i className="fas fa-exclamation-circle fa-2x mb-3 text-danger"></i>
          <h3>Error</h3>
          <p className="text-light">{error || 'Failed to load forecast data'}</p>
        </div>
      </div>
    );
  }

  // Get next 8 forecast items (24 hours)
  const forecastItems = forecastData.forecast.slice(0, 8);

  return (
    <div className="card weather-card bg-dark text-light">
      <div className="card-body">
        <h3 className="card-title">Weather Forecast</h3>
        
        <div className="forecast-container mt-3">
          <div className="forecast-scroll">
            {forecastItems.map((item, index) => {
              const date = new Date(item.datetime * 1000);
              const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const temp = Math.round(item.temp);
              const iconCode = item.weather.icon;
              const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
              
              return (
                <div key={index} className="forecast-item bg-secondary bg-opacity-25">
                  <div className="text-light">{time}</div>
                  <img src={iconUrl} alt={item.weather.description} className="my-2" />
                  <div className="fw-bold">{temp}°C</div>
                  <div className="small text-capitalize">{item.weather.description}</div>
                  <div className="small"><i className="fas fa-tint"></i> {(item.precipitation_prob * 100).toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-4 chart-container">
          <canvas id="forecast-chart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;