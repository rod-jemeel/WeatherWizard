import { useState } from 'react';

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface HeaderProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 3) return;

    setIsLoading(true);
    try {
      // Use Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search for location');
      }
      
      const data: SearchResult[] = await response.json();
      setSearchResults(data.slice(0, 5)); // Limit to first 5 results
    } catch (error) {
      console.error('Error searching for location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (result: SearchResult) => {
    onLocationSelect(
      parseFloat(result.lat), 
      parseFloat(result.lon), 
      result.display_name
    );
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <header className="bg-dark py-3">
      <div className="container">
        <div className="d-flex flex-column flex-md-row align-items-center">
          <h1 className="mb-3 mb-md-0 me-md-auto">
            <i className="fas fa-cloud me-2 text-info"></i>
            Weather App
          </h1>
          
          {/* Search Box */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="d-flex">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search for a location..." 
                  aria-label="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required 
                />
                <button className="btn btn-info" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="fas fa-search"></i>
                  )}
                </button>
              </div>
            </form>
            
            {searchResults.length > 0 && (
              <div className="list-group search-results shadow-lg">
                {searchResults.map((result, index) => (
                  <button 
                    key={index} 
                    className="list-group-item list-group-item-action"
                    onClick={() => handleLocationSelect(result)}
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;