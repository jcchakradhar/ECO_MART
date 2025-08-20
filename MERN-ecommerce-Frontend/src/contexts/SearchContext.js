import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const searchProducts = async (query, page = 1, sort = null) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add debug logs to track the request
      const params = new URLSearchParams({ q: query, page: String(page), limit: '12' });
      if (sort && sort._sort && sort._order) {
        params.set('_sort', sort._sort);
        params.set('_order', sort._order);
      }
      const reqUrl = `/products/search?${params.toString()}`;
      console.log('Frontend - Making search request:', reqUrl);

      const response = await axios.get(reqUrl);

      console.log('Frontend - API Response:', response.data);

      const { products, ...paginationInfo } = response.data;

      // Add safety checks to prevent undefined errors
      setSearchResults(products || []); // ✅ Ensure it's always an array
      setPagination(paginationInfo || {
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      setSearchTerm(query);

    } catch (err) {
      console.error('Frontend - Search error:', err);
      console.error('Frontend - Error response:', err.response);

      // Set safe default values on error
      setSearchResults([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        hasNextPage: false,
        hasPrevPage: false
      });

      setError('Failed to search products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setSearchTerm('');
    setError(null);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      hasNextPage: false,
      hasPrevPage: false
    });
  };

  const value = {
    searchResults,
    isLoading,
    searchTerm,
    error,
    pagination,
    searchProducts,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
