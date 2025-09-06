import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { fetchSearchRecommendationsAPI } from '../features/product/productAPI';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

// Simple session cache utilities
const CACHE_KEY = 'searchRecsV1';
const loadSearchCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
};
const saveSearchCache = (cacheObj) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
  } catch (e) { }
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
  // Cache structure: { [normalizedQuery]: { items: Product[], ts: number } }
  const cacheRef = useRef({});

  // hydrate cache from sessionStorage once per session
  useEffect(() => {
    cacheRef.current = loadSearchCache();
  }, []);

  const sortProducts = (items, sort) => {
    if (!sort || !sort._sort) return items;
    const key = sort._sort;
    const dir = (sort._order || 'desc').toLowerCase() === 'asc' ? 1 : -1;

    const gradeRank = { 'A+': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    const getComparable = (prod) => {
      if (!prod) return null;
      // Handle eco/water rating grades specially
      if (key === 'Eco_Rating' || key === 'Water_Rating') {
        const raw = (prod[key] ?? '').toString().trim().toUpperCase();
        const rank = gradeRank[raw];
        return typeof rank === 'number' ? rank : null;
      }
      // Handle price with discount fallback
      if (key === 'discountPrice' || key === 'price') {
        const dp = prod.discountPrice;
        const p = prod.price;
        const val = Number.isFinite(dp) ? dp : Number.isFinite(p) ? p : null;
        return typeof val === 'number' ? val : null;
      }
      // Default behavior: direct field
      return prod[key] ?? null;
    };

    return [...items].sort((a, b) => {
      const va = getComparable(a);
      const vb = getComparable(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  };

  const searchProducts = async (query, page = 1, sort = null) => {
    if (!query.trim()) return;

    setError(null);
    const normalized = query.trim().toLowerCase();
    const cached = cacheRef.current[normalized]?.items;

    // If we have cached full results for this query, use them without refetching
    if (Array.isArray(cached) && cached.length >= 0) {
      const pageSize = 12;
      const productsSorted = sortProducts(cached, sort);
      const totalResults = productsSorted.length;
      const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageSlice = productsSorted.slice(start, end);

      setSearchResults(pageSlice);
      setPagination({
        currentPage,
        totalPages,
        totalResults,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      });
      setSearchTerm(query);
      setIsLoading(false);
      return;
    }

    // No cache: fetch once, resolve details, cache for this session
    setIsLoading(true);

    try {
      // Call Python recommendations search to get product IDs
      const rec = await fetchSearchRecommendationsAPI(query);
      const ids = Array.isArray(rec.data) ? rec.data : [];
      // Resolve product details in parallel
      const detailResponses = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await axios.get(`/products/${id}`);
            return res.data;
          } catch (e) {
            return null;
          }
        })
      );
      const products = detailResponses.filter(Boolean);
      // Cache base (unsorted) result for this query
      cacheRef.current[normalized] = { items: products, ts: Date.now() };
      saveSearchCache(cacheRef.current);

      // Client-side sort if requested
      const productsSorted = sortProducts(products, sort);
      // Client-side paginate 12 per page to match previous behavior
      const pageSize = 12;
      const totalResults = productsSorted.length;
      const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageSlice = productsSorted.slice(start, end);

      setSearchResults(pageSlice);
      setPagination({
        currentPage,
        totalPages,
        totalResults,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
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
