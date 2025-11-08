import React, { Fragment, useEffect, useState } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { Link, useSearchParams } from 'react-router-dom'; // 👈 1. Import useSearchParams
import NavBar from '../features/navbar/Navbar';
import Footer from '../features/common/Footer';
import Pagination from '../features/common/Pagination';
import ProductCard from '../features/product/components/ProductCard';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo, updateUserAsync } from '../features/user/userSlice';

const sortFieldOptions = [
  { name: 'Rating', value: 'rating' },
  { name: 'Price', value: 'discountPrice' },
  { name: 'Eco Rating', value: 'Eco_Rating' },
  { name: 'Water Rating', value: 'Water_Rating' },
];
const sortOrderOptions = [
  { name: 'High to Low', value: 'desc' },
  { name: 'Low to High', value: 'asc' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SearchResults = () => {
  const {
    searchResults,
    isLoading,
    searchTerm,
    error,
    pagination,
    searchProducts
  } = useSearch();
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);

  // 2. Get the search params from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const sortParam = searchParams.get('_sort');
  const orderParam = searchParams.get('_order');
  const [page, setPage] = useState(pageParam);
  const [sort, setSort] = useState(
    sortParam && orderParam ? { _sort: sortParam, _order: orderParam } : { _sort: 'rating', _order: 'desc' }
  );

  // 3. Use useEffect to trigger a search whenever the query in the URL changes
  useEffect(() => {
    if (!query) return;
    const p = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    setPage(p);
    const s = sortParam && orderParam ? { _sort: sortParam, _order: orderParam } : { _sort: 'rating', _order: 'desc' };
    setSort(s);
    searchProducts(query, p, s);
  }, [query, pageParam, sortParam, orderParam]);

  // Persist search term to user's searchHistory (dedup, cap 10) once per session per query
  useEffect(() => {
    if (!query || !userInfo?.id) return;
    try {
      const normalized = query.trim().toLowerCase();
      const sessionKey = `searchHistorySynced:${userInfo.id}:${normalized}`;
      if (sessionStorage.getItem(sessionKey)) return;

      const existing = Array.isArray(userInfo.searchHistory) ? userInfo.searchHistory : [];
      const next = [query, ...existing.filter((q) => typeof q === 'string' && q.toLowerCase() !== normalized)];
      const capped = next.slice(0, 10);

      dispatch(updateUserAsync({ id: userInfo.id, searchHistory: capped }));
      sessionStorage.setItem(sessionKey, '1');
    } catch (_) {
      // no-op on storage errors
    }
  }, [dispatch, query, userInfo?.id]);

  const handlePageChange = (nextPage) => {
    if (!query) return;
    const next = Math.max(1, Math.min(nextPage, pagination.totalPages || 1));
    setPage(next);
    searchProducts(query, next, sort);
    // Reflect current page in URL for deep-link/back navigation
    const params = { q: query, page: String(next) };
    if (sort._sort && sort._order) {
      params._sort = sort._sort;
      params._order = sort._order;
    }
    setSearchParams(params);
  };

  const handleFieldChange = (field) => {
    const nextSort = { _sort: field, _order: sort._order || 'desc' };
    setSort(nextSort);
    setPage(1);
    searchProducts(query, 1, nextSort);
    setSearchParams({ q: query, page: '1', _sort: nextSort._sort, _order: nextSort._order });
  };

  const handleOrderChange = (order) => {
    const nextSort = { _sort: sort._sort || 'rating', _order: order };
    setSort(nextSort);
    setPage(1);
    searchProducts(query, 1, nextSort);
    setSearchParams({ q: query, page: '1', _sort: nextSort._sort, _order: nextSort._order });
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

        {/* Search Results Header with Sort */}
        {searchTerm && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-emerald-800 mb-2">
                Search Results for "{searchTerm}"
              </h1>
              <p className="text-emerald-600">
                {pagination.totalResults} products found
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Sort Field Menu */}
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2 bg-white hover:bg-gray-50">
                    Sort by
                    <ChevronDownIcon className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  </Menu.Button>
                </div>

                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortFieldOptions.map((option) => (
                        <Menu.Item key={option.value}>
                          {({ active }) => (
                            <button onClick={() => handleFieldChange(option.value)} className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block w-full px-4 py-2 text-left text-sm hover:bg-gray-50')}>
                              {option.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Order Menu */}
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2 bg-white hover:bg-gray-50">
                    Order
                    <ChevronDownIcon className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  </Menu.Button>
                </div>

                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortOrderOptions.map((option) => (
                        <Menu.Item key={option.value}>
                          {({ active }) => (
                            <button onClick={() => handleOrderChange(option.value)} className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block w-full px-4 py-2 text-left text-sm hover:bg-gray-50')}>
                              {option.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Clear Sort */}
              <button
                type="button"
                onClick={() => {
                  const nextSort = {};
                  setSort(nextSort);
                  setPage(1);
                  searchProducts(query, 1, nextSort);
                  setSearchParams({ q: query, page: '1' });
                }}
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-50"
                title="Clear sort"
              >
                Clear
              </button>
            </div>
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