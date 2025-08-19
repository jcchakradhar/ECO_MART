import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../../../contexts/SearchContext';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({
  isMobile = false,
  customClasses = null,
  iconClasses = null,
  placeholder = "Search products..."
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showClearButton, setShowClearButton] = useState(false);
  const { clearSearch } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    setShowClearButton(localSearchTerm.length > 0);
  }, [localSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      // Navigate with query in URL; SearchResults will perform the fetch
      navigate(`/search-results?q=${encodeURIComponent(localSearchTerm)}`);
    }
  };

  const handleInputChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    clearSearch();
  };

  // Use custom classes if provided, otherwise use default classes
  const inputClasses = customClasses || (isMobile
    ? "block w-full pl-10 pr-10 py-2 border border-transparent rounded-full leading-5 bg-white/10 backdrop-blur-sm text-white placeholder-emerald-200 focus:outline-none focus:bg-white/20 text-sm"
    : "block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500");

  const searchIconClasses = iconClasses || (isMobile ? 'text-emerald-300' : 'text-gray-400');
  const clearIconClasses = isMobile ? 'text-emerald-300' : 'text-gray-400';

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className={`h-5 w-5 ${searchIconClasses}`} />
      </div>

      <input
        type="text"
        value={localSearchTerm}
        onChange={handleInputChange}
        className={inputClasses}
        placeholder={placeholder}
      />

      {showClearButton && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <XMarkIcon className={`h-5 w-5 ${clearIconClasses} hover:text-gray-600`} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
