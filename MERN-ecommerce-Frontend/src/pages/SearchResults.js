import React, { useEffect } from 'react';
import { useSearch } from '../contexts/SearchContext';
import SearchBar from '../features/auth/components/SearchBar';
import { Link, useSearchParams } from 'react-router-dom'; // 👈 1. Import useSearchParams

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
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  // 3. Use useEffect to trigger a search whenever the query in the URL changes
  useEffect(() => {
    if (query) {
      searchProducts(query);
    }
  }, [query, searchProducts]);

  const handlePageChange = (page) => {
    if (query) {
      // Use the query from the URL for pagination
      searchProducts(query, page);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar 
            isMobile={false}
            customClasses="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            placeholder="Search eco-friendly products..."
          />
        </div>

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
                <div 
                  key={product.id} // 👈 4. FIX: Use product.id for the key
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-emerald-100"
                >
                  {/* Product Image */}
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <img
                      src={product.thumbnail || product.imgUrl || 'https://via.placeholder.com/300x300'}
                      alt={product.title}
                      className="h-48 w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    
                    {product.brand && (
                      <p className="text-sm text-emerald-600 mb-2 font-medium">
                        {product.brand}
                      </p>
                    )}
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {product.discountPrice && product.discountPrice < product.price ? (
                          <>
                            <span className="text-lg font-bold text-emerald-600">
                              ${product.discountPrice}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-emerald-600">
                            ${product.price}
                          </span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="flex items-center">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>
                                        
                    {/* View Product Button */}
                    <Link
                      to={`/product-detail/${product.id}`} // 👈 5. FIX: Use product.id for the link
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-6 py-3 bg-white border border-emerald-300 text-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors duration-200 font-medium"
                >
                  Previous
                </button>
                
                <span className="text-emerald-700 font-medium">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-6 py-3 bg-white border border-emerald-300 text-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors duration-200 font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;