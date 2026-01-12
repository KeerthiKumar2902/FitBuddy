import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NutritionDetailModal from '../components/nutrition/NutritionDetailModal';
import featuredFoods from '../data/featuredFoods.json';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const COMMON_SEARCHES = ['Apple', 'Banana', 'Spinach', 'Lentils', 'Broccoli', 'Chicken Breast'];

// --- NEW: A simple SVG Loading Spinner Component ---
const Spinner = () => (
  <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const NutritionHubPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // --- NEW: Track if a search has been performed ---

  const handleSearch = async (query) => {
    if (!query) return;
    setIsLoading(true);
    setSearchResults([]);
    setError('');
    setHasSearched(true); // --- NEW: Mark that a search has happened ---

    try {
      const response = await fetch(`https://api.spoonacular.com/food/ingredients/search?query=${query}&number=20&apiKey=${API_KEY}`);
      if (!response.ok) throw new Error('Search request failed.');
      const data = await response.json();
      setSearchResults(data.results);
    } catch (err) {
      setError('Could not fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleViewDetails = async (id) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/information?amount=100&unit=g&apiKey=${API_KEY}`);
      if (!response.ok) throw new Error('Could not fetch details.');
      const data = await response.json();
      setSelectedItemDetail(data);
    } catch (err) {
      setError('Could not fetch item details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Link to="/" className="text-green-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Nutrition Hub</h1>
          <p className="text-lg text-gray-600">Search for any food item to see its full nutritional profile.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="max-w-xl mx-auto mb-8 flex gap-2">
          <input
            type="text"
            placeholder="Search for... (e.g., 'Banana', 'Lentils')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700">Search</button>
        </form>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {COMMON_SEARCHES.map(item => (
            <button key={item} onClick={() => {setSearchTerm(item); handleSearch(item);}} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
              {item}
            </button>
          ))}
        </div>

        <div>
          {isLoading && (
            <div className="flex justify-center p-12">
              <Spinner />
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          
          {/* --- UPDATED: Show search results --- */}
          {!isLoading && hasSearched && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Results</h2>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {searchResults.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => handleViewDetails(item.id)}
                      className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow group"
                    >
                      <img 
                        src={`https://spoonacular.com/cdn/ingredients_100x100/${item.image}`} 
                        alt={item.name} 
                        className="w-24 h-24 object-contain mx-auto transition-transform duration-300 group-hover:scale-110"
                      />
                      <p className="mt-2 font-semibold text-gray-700 capitalize">{item.name}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No results found for "{searchTerm}".</p>
              )}
            </>
          )}

          {/* --- UPDATED: Show featured foods only if user has NOT searched --- */}
          {!isLoading && !hasSearched && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Foods</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredFoods.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => handleViewDetails(item.id)}
                    className="bg-white rounded-lg shadow-lg overflow-hidden group text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Image container */}
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* --- UPDATED: Text is now in its own div below the image --- */}
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-800 capitalize">{item.name}</h3>
                      <p className="text-sm text-green-600 font-semibold mt-1">View Nutrition &rarr;</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedItemDetail && (
        <NutritionDetailModal 
          item={selectedItemDetail} 
          onClose={() => setSelectedItemDetail(null)} 
        />
      )}
    </div>
  );
};

export default NutritionHubPage;

