import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../../src/components/Header';

// Mock fetch for location search
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { 
        lat: '40.7128',
        lon: '-74.0060',
        display_name: 'New York, NY, USA'
      }
    ])
  })
);

describe('Header Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the header with search input', () => {
    const mockOnLocationSelect = jest.fn();
    render(<Header onLocationSelect={mockOnLocationSelect} />);
    
    // Check if the header title is present
    expect(screen.getByText('Weather App')).toBeInTheDocument();
    
    // Check if the search input is present
    expect(screen.getByPlaceholderText('Search for a location...')).toBeInTheDocument();
  });

  it('performs a location search when form is submitted', async () => {
    const mockOnLocationSelect = jest.fn();
    render(<Header onLocationSelect={mockOnLocationSelect} />);
    
    // Get the search input and submit button
    const searchInput = screen.getByPlaceholderText('Search for a location...');
    const submitButton = screen.getByRole('button', { type: /submit/i });
    
    // Type in the search box and submit the form
    fireEvent.change(searchInput, { target: { value: 'New York' } });
    fireEvent.click(submitButton);
    
    // Check if fetch was called with the right URL
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('New York')
      );
    });
    
    // Wait for the results to be displayed
    await waitFor(() => {
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
    });
    
    // Click on a search result
    fireEvent.click(screen.getByText('New York, NY, USA'));
    
    // Check if the callback was called with the right arguments
    expect(mockOnLocationSelect).toHaveBeenCalledWith(
      40.7128, -74.0060, 'New York, NY, USA'
    );
  });
});