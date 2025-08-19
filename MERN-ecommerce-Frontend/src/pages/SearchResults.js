import React, { useEffect, useState } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { Link, useSearchParams } from 'react-router-dom'; // 👈 1. Import useSearchParams
import NavBar from '../features/navbar/Navbar';
import Footer from '../features/common/Footer';
import Pagination from '../features/common/Pagination';
import ProductCard from '../features/product/components/ProductCard';

const SearchResults = () => {
  const {
    searchResults,
    isLoading,
    searchTerm,
    error,
    pagination,
    searchProducts
  } = useSearch();

  // 2. Get the search params from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(pageParam);

  // 3. Use useEffect to trigger a search whenever the query in the URL changes
  useEffect(() => {
    if (!query) return;
    const p = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    setPage(p);
    searchProducts(query, p);
  }, [query, pageParam]);

  const handlePageChange = (nextPage) => {
    if (!query) return;
    const next = Math.max(1, Math.min(nextPage, pagination.totalPages || 1));
    setPage(next);
    searchProducts(query, next);
    // Reflect current page in URL for deep-link/back navigation
    setSearchParams({ q: query, page: String(next) });
  };

  if (isLoading) {
    return (
      <>
        <NavBar showHeader={false}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          </div>
        </NavBar>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar showHeader={false}>

        {/* Search Results Header */}
        {searchTerm && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">
              Search Results for "{searchTerm}"
            </h1>
            <p className="text-emerald-600">
              {pagination.totalResults} products found
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && searchResults.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              No products found
            </h2>
            <p className="text-emerald-600 mb-6">
              Try adjusting your search term or browse our categories
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {searchResults.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {searchResults.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  linkState={{ from: 'search', q: query, page }}
                />
              ))}
            </div>

            {/* Pagination (reuse common component like Home) */}
            {pagination.totalResults > 0 && (
              <div className="mt-8">
                <Pagination
                  page={page}
                  setPage={setPage}
                  handlePage={handlePageChange}
                  totalItems={pagination.totalResults}
                />
              </div>
            )}
          </>
        )}
      </NavBar>
      <Footer />
    </>
  );
};

export default SearchResults;