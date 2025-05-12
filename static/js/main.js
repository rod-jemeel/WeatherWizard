/**
 * Main JavaScript file for Weather Application
 * Handles API requests and UI updates
 */

// Fetch weather data for a specific location
function fetchWeatherForLocation(lat, lon) {
    // Show loading indicators
    showLoading('#weather-current');
    showLoading('#weather-forecast');
    showLoading('#weather-description');
    
    // Fetch current weather data
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            return response.json();
        })
        .then(weatherData => {
            // Update current weather UI
            updateCurrentWeather(weatherData);
            
            // Update weather chart
            updateCurrentWeatherChart(weatherData);
            
            // Hide loading indicator
            hideLoading('#weather-current');
            
            // Fetch AI-powered weather description
            fetchWeatherDescription(lat, lon);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            showError('Failed to load weather data. Please try again.');
            hideLoading('#weather-current');
        });
    
    // Fetch forecast data
    fetch(`/api/forecast?lat=${lat}&lon=${lon}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            return response.json();
        })
        .then(forecastData => {
            // Update forecast UI
            updateForecast(forecastData);
            
            // Update forecast chart
            updateForecastChart(forecastData);
            
            // Hide loading indicator
            hideLoading('#weather-forecast');
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            showError('Failed to load forecast data. Please try again.');
            hideLoading('#weather-forecast');
        });
}

// Fetch AI-powered weather description
function fetchWeatherDescription(lat, lon) {
    fetch(`/api/weather_description?lat=${lat}&lon=${lon}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch weather description');
            }
            return response.json();
        })
        .then(data => {
            // Update description UI
            updateWeatherDescription(data.description);
            
            // Hide loading indicator
            hideLoading('#weather-description');
        })
        .catch(error => {
            console.error('Error fetching weather description:', error);
            document.getElementById('weather-description').innerHTML = 
                `<p class="text-danger">Failed to load AI description. Please try again.</p>`;
            hideLoading('#weather-description');
        });
}

// Update current weather UI
function updateCurrentWeather(data) {
    const container = document.getElementById('weather-current');
    
    if (!container) return;
    
    const iconCode = data.current.weather.icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    const temp = Math.round(data.current.temp);
    const feelsLike = Math.round(data.current.feels_like);
    
    container.innerHTML = `
        <div class="card weather-card bg-dark text-light">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2>${data.location.name}, ${data.location.country}</h2>
                        <p class="mb-0">${new Date(data.current.datetime * 1000).toLocaleString()}</p>
                    </div>
                    <div class="text-center">
                        <img src="${iconUrl}" alt="${data.current.weather.description}" class="weather-icon">
                        <p class="text-capitalize mb-0">${data.current.weather.description}</p>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h3 class="display-4">${temp}°C</h3>
                        <p>Feels like ${feelsLike}°C</p>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex flex-column">
                            <div class="d-flex justify-content-between">
                                <span>Humidity</span>
                                <span>${data.current.humidity}%</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Wind</span>
                                <span>${data.current.wind_speed} m/s</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Pressure</span>
                                <span>${data.current.pressure} hPa</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Visibility</span>
                                <span>${(data.current.visibility / 1000).toFixed(1)} km</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <canvas id="temperature-chart" height="200"></canvas>
                </div>
            </div>
        </div>
    `;
}

// Update forecast UI
function updateForecast(data) {
    const container = document.getElementById('weather-forecast');
    
    if (!container) return;
    
    let forecastHTML = `
        <div class="card weather-card bg-dark text-light">
            <div class="card-body">
                <h3 class="card-title">Weather Forecast</h3>
                
                <div class="forecast-container mt-3">
                    <div class="forecast-scroll">
    `;
    
    // Get next 8 forecast items (24 hours)
    const forecastItems = data.forecast.slice(0, 8);
    
    forecastItems.forEach(item => {
        const date = new Date(item.datetime * 1000);
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.temp);
        const iconCode = item.weather.icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        
        forecastHTML += `
            <div class="forecast-item bg-secondary bg-opacity-25">
                <div class="text-light">${time}</div>
                <img src="${iconUrl}" alt="${item.weather.description}" class="my-2">
                <div class="fw-bold">${temp}°C</div>
                <div class="small text-capitalize">${item.weather.description}</div>
                <div class="small"><i class="fas fa-tint"></i> ${(item.precipitation_prob * 100).toFixed(0)}%</div>
            </div>
        `;
    });
    
    forecastHTML += `
                    </div>
                </div>
                
                <div class="mt-4">
                    <canvas id="forecast-chart" height="250"></canvas>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = forecastHTML;
}

// Update weather description UI
function updateWeatherDescription(description) {
    const container = document.getElementById('weather-description');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="card weather-card bg-dark text-light">
            <div class="card-body">
                <h3 class="card-title">
                    <i class="fas fa-robot me-2"></i>AI Weather Insights
                </h3>
                <p class="ai-description mt-3">${description}</p>
            </div>
        </div>
    `;
}

// Show loading indicator
function showLoading(selector) {
    const container = document.querySelector(selector);
    
    if (!container) return;
    
    // Check if loading overlay already exists
    if (container.querySelector('.loading-overlay')) return;
    
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="spinner-container">
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 mb-0">Loading...</p>
        </div>
    `;
    
    // Add position relative to container for absolute positioning
    container.style.position = 'relative';
    
    // Add loading overlay to container
    container.appendChild(loadingOverlay);
}

// Hide loading indicator
function hideLoading(selector) {
    const container = document.querySelector(selector);
    
    if (!container) return;
    
    // Find and remove loading overlay
    const loadingOverlay = container.querySelector('.loading-overlay');
    
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Show error message
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for search form
    const searchForm = document.getElementById('search-form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = document.getElementById('search-input').value.trim();
            
            if (query) {
                // Clear search results
                document.getElementById('search-results').innerHTML = '';
                
                // Search for location
                searchLocation(query);
            }
        });
    }
});
