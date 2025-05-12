/**
 * Map and Heatmap Functionality
 * Handles map initialization, location search, and heatmap visualization
 */

let map;
let heatmapLayer;
let currentMarker;
let searchMarkers = [];
let currentHeatmapType = 'temperature';

// Initialize the map
function initMap() {
    // Create map centered at a default location (North America)
    map = L.map('map-container').setView([40, -95], 4);
    
    // Add the base map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Add empty heatmap layer
    heatmapLayer = L.heatLayer([], {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: getHeatmapGradient(currentHeatmapType)
    }).addTo(map);
    
    // Add click event to the map
    map.on('click', handleMapClick);
    
    // Add zoom end event to update heatmap on zoom changes
    map.on('zoomend', function() {
        updateHeatmap();
    });
    
    // Add moveend event to update heatmap when map is moved
    map.on('moveend', function() {
        if (map.getZoom() < 7) {
            updateHeatmap();
        }
    });
    
    // Initialize the heatmap
    updateHeatmap();
    
    // Add heatmap type controls to the map
    addHeatmapControls();
}

// Handle map click events
function handleMapClick(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    
    // Remove previous marker if it exists
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    // Add marker at clicked location
    currentMarker = L.marker([lat, lng]).addTo(map);
    
    // Display loading indicator
    showLoading('#weather-current');
    showLoading('#weather-forecast');
    showLoading('#weather-description');
    
    // Fetch weather data for clicked location
    fetchWeatherForLocation(lat, lng);
}

// Update the heatmap based on current view
function updateHeatmap() {
    // Get current map bounds
    const bounds = map.getBounds();
    
    // Show loading indicator
    showLoading('#map-container');
    
    // Fetch heatmap data from API
    fetch(`/api/heatmap?type=${currentHeatmapType}&north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch heatmap data');
            }
            return response.json();
        })
        .then(data => {
            // Update heatmap with new data
            heatmapLayer.setLatLngs(data);
            
            // Hide loading indicator
            hideLoading('#map-container');
        })
        .catch(error => {
            console.error('Error fetching heatmap data:', error);
            showError('Failed to load heatmap data. Please try again.');
            hideLoading('#map-container');
        });
}

// Get gradient colors based on heatmap type
function getHeatmapGradient(type) {
    switch (type) {
        case 'temperature':
            return {
                0.0: 'blue',
                0.3: 'cyan',
                0.5: 'lime',
                0.7: 'yellow',
                1.0: 'red'
            };
        case 'precipitation':
            return {
                0.0: 'rgba(0, 0, 255, 0)',
                0.2: 'rgba(0, 0, 255, 0.7)',
                0.4: 'rgba(0, 255, 255, 0.8)',
                0.6: 'rgba(0, 255, 0, 0.8)',
                0.8: 'rgba(255, 255, 0, 0.8)',
                1.0: 'rgba(255, 0, 0, 0.8)'
            };
        case 'humidity':
            return {
                0.0: 'rgba(255, 255, 0, 0.7)',
                0.5: 'rgba(0, 255, 0, 0.8)',
                0.8: 'rgba(0, 0, 255, 0.9)',
                1.0: 'rgba(128, 0, 128, 1)'
            };
        case 'pressure':
            return {
                0.0: 'purple',
                0.3: 'blue',
                0.5: 'green',
                0.7: 'yellow',
                1.0: 'red'
            };
        default:
            return {
                0.0: 'blue',
                0.3: 'cyan',
                0.5: 'lime',
                0.7: 'yellow',
                1.0: 'red'
            };
    }
}

// Change heatmap type
function changeHeatmapType(type) {
    currentHeatmapType = type;
    
    // Update heatmap gradient
    heatmapLayer.setOptions({
        gradient: getHeatmapGradient(type)
    });
    
    // Update active button state
    document.querySelectorAll('.heatmap-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#heatmap-${type}`).classList.add('active');
    
    // Update heatmap data
    updateHeatmap();
}

// Add heatmap controls to the map
function addHeatmapControls() {
    // Create control container
    const controlContainer = L.control({ position: 'topright' });
    
    controlContainer.onAdd = function() {
        const div = L.DomUtil.create('div', 'heatmap-controls');
        div.innerHTML = `
            <div class="btn-group" role="group" aria-label="Heatmap type">
                <button type="button" id="heatmap-temperature" class="btn btn-sm btn-primary heatmap-type-btn active">Temperature</button>
                <button type="button" id="heatmap-precipitation" class="btn btn-sm btn-primary heatmap-type-btn">Precipitation</button>
                <button type="button" id="heatmap-humidity" class="btn btn-sm btn-primary heatmap-type-btn">Humidity</button>
                <button type="button" id="heatmap-pressure" class="btn btn-sm btn-primary heatmap-type-btn">Pressure</button>
            </div>
        `;
        
        // Prevent clicks from propagating to the map
        L.DomEvent.disableClickPropagation(div);
        
        return div;
    };
    
    controlContainer.addTo(map);
    
    // Add event listeners to buttons
    document.getElementById('heatmap-temperature').addEventListener('click', () => changeHeatmapType('temperature'));
    document.getElementById('heatmap-precipitation').addEventListener('click', () => changeHeatmapType('precipitation'));
    document.getElementById('heatmap-humidity').addEventListener('click', () => changeHeatmapType('humidity'));
    document.getElementById('heatmap-pressure').addEventListener('click', () => changeHeatmapType('pressure'));
}

// Handle location search
function searchLocation(query) {
    if (!query || query.length < 3) {
        document.getElementById('search-results').innerHTML = '';
        return;
    }
    
    // Use Nominatim for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('search-results');
            
            if (data.length === 0) {
                resultsContainer.innerHTML = '<div class="list-group-item">No results found</div>';
                return;
            }
            
            // Limit to first 5 results
            const places = data.slice(0, 5);
            
            let html = '';
            places.forEach(place => {
                html += `
                    <a href="#" class="list-group-item list-group-item-action search-result" 
                       data-lat="${place.lat}" data-lon="${place.lon}">
                        ${place.display_name}
                    </a>
                `;
            });
            
            resultsContainer.innerHTML = html;
            
            // Add click event to search results
            document.querySelectorAll('.search-result').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const lat = this.dataset.lat;
                    const lon = this.dataset.lon;
                    
                    // Clear search results
                    resultsContainer.innerHTML = '';
                    document.getElementById('search-input').value = this.textContent.trim();
                    
                    // Move map to selected location
                    map.setView([lat, lon], 10);
                    
                    // Create marker at selected location
                    if (currentMarker) {
                        map.removeLayer(currentMarker);
                    }
                    
                    currentMarker = L.marker([lat, lon]).addTo(map);
                    
                    // Fetch weather data for selected location
                    fetchWeatherForLocation(lat, lon);
                });
            });
        })
        .catch(error => {
            console.error('Error searching for location:', error);
            document.getElementById('search-results').innerHTML = 
                '<div class="list-group-item text-danger">Error searching for location</div>';
        });
}

// Initialize map functionality when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map when the page is loaded
    initMap();
    
    // Add event listener for search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchLocation(this.value);
        });
    }
    
    // Get user's location on page load if allowed
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Set map view to user's location
                map.setView([lat, lng], 10);
                
                // Create marker at user's location
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
                
                currentMarker = L.marker([lat, lng]).addTo(map);
                
                // Fetch weather data for user's location
                fetchWeatherForLocation(lat, lng);
            },
            function(error) {
                console.warn('Unable to get user location:', error.message);
                // Use default view
            }
        );
    }
});
