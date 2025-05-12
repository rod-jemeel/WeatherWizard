/**
 * Weather Charts Functionality
 * Creates and updates weather charts using Chart.js
 */

// Store chart instances to update later
let temperatureChart = null;
let forecastChart = null;

// Initialize weather charts
function initCharts() {
    // Set default Chart.js options for dark theme
    Chart.defaults.color = '#f8f9fa';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
}

// Create or update current weather chart
function updateCurrentWeatherChart(weatherData) {
    const ctx = document.getElementById('temperature-chart');
    
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    
    // Create data for the chart
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
    
    // Create chart configuration
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
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
    
    // Create new chart
    temperatureChart = new Chart(ctx, config);
}

// Create or update forecast chart
function updateForecastChart(forecastData) {
    const ctx = document.getElementById('forecast-chart');
    
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (forecastChart) {
        forecastChart.destroy();
    }
    
    // Process forecast data
    const timestamps = [];
    const temperatures = [];
    const feelsLike = [];
    const rainProbability = [];
    
    // Get next 8 forecast items (24 hours)
    const forecastItems = forecastData.forecast.slice(0, 8);
    
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
    
    // Create data for the chart
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
    
    // Create chart configuration
    const config = {
        type: 'line',
        data: data,
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
                        label: function(context) {
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
    
    // Create new chart
    forecastChart = new Chart(ctx, config);
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
});
