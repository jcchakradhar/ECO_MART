import React, { useState, Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProductsByFiltersAsync,
  selectAllProducts,
  selectProductListStatus,
  selectTotalItems,
  selectRecommendedProducts,
} from '../productSlice';
import { Menu, Transition } from '@headlessui/react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ITEMS_PER_PAGE } from '../../../app/constants';
import Pagination from '../../common/Pagination';
import { Grid } from 'react-loader-spinner';
import sustainabilityImage from '../../../assests/generated-image.png';
import ProductCard from './ProductCard';

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

// Hero Banner Component
function HeroBanner() {
  const [quote, setQuote] = useState('');
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/motivation');
        const data = await res.json();
        if (active) setQuote(data?.message || 'Small steps make a big difference.');
      } catch (e) {
        if (active) setQuote('Small steps make a big difference. Try one more eco-friendly switch today!');
      }
    })();
    return () => { active = false; };
  }, []);
  return (
    <div className="relative w-full">
      {/* Overlayed Quote on the banner image */}
      <div className="w-full h-[40vh] sm:h-[45vh] lg:h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-100 to-yellow-100 relative">
        {quote && (
          <div className="absolute left-0 top-2 px-6 sm:px-10 lg:px-20 z-10">
            <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black leading-tight  rounded pr-4 py-2">
              {quote}
            </h4>
          </div>
        )}
        <img
          src={sustainabilityImage}
          alt="Shop sustainably"
          className="object-contain h-full w-auto"
        />
      </div>
      {/* Support line below, slightly de-emphasized */}
    </div>
  );
}

export default function ProductList() {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const totalItems = useSelector(selectTotalItems);
  const status = useSelector(selectProductListStatus);
  const recommended = useSelector(selectRecommendedProducts);
  // Filters removed: we no longer use categories/brands in the UI
  const [sort, setSort] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const sortParam = searchParams.get('_sort');
  const orderParam = searchParams.get('_order');
  const [page, setPage] = useState(pageParam);

  // initialize sort from URL if present
  useEffect(() => {
    if (sortParam && orderParam) {
      setSort({ _sort: sortParam, _order: orderParam });
    } else {
      // default: Rating High to Low
      setSort({ _sort: 'rating', _order: 'desc' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFieldChange = (field) => {
    const next = { _sort: field, _order: sort._order || 'desc' };
    setSort(next);
    setPage(1);
    setSearchParams({ page: '1', _sort: next._sort, _order: next._order });
  };

  const handleOrderChange = (order) => {
    const next = { _sort: sort._sort || 'rating', _order: order };
    setSort(next);
    setPage(1);
    setSearchParams({ page: '1', _sort: next._sort, _order: next._order });
  };

  const handlePage = (pageNum) => {
    setPage(pageNum);
    const params = { page: String(pageNum) };
    if (sort._sort && sort._order) {
      params._sort = sort._sort;
      params._order = sort._order;
    }
    setSearchParams(params);
  };

  useEffect(() => {
    // If recommendations are present, show them and skip generic fetch for this render
    if (recommended && recommended.length > 0) return;
    const pagination = { _page: page, _limit: ITEMS_PER_PAGE };
    dispatch(fetchProductsByFiltersAsync({ filter: {}, sort, pagination }));
  }, [dispatch, sort, page, recommended]);

  useEffect(() => {
    // If sort changes, keep current page in URL; optionally reset if needed.
    // setPage(1);
  }, [totalItems, sort]);

  // Removed fetching brands/categories since not used in UI

  return (
    <div className="bg-white min-h-screen">
      <div>
        {/* Filters removed from UI */}

        {/* Large Amazon-style Hero Banner */}
        <HeroBanner />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Sort/Filter Header - Now below the banner */}
          <div className="flex items-center justify-between bg-white border-b border-gray-200 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {recommended && recommended.length > 0 ? 'Recommended for you' : 'All Products'}
              </h2>
              <p className="text-sm text-gray-600">
                {recommended && recommended.length > 0 ? recommended.length : totalItems} results
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
                            <button
                              onClick={() => handleFieldChange(option.value)}
                              className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block w-full px-4 py-2 text-left text-sm hover:bg-gray-50')}
                            >
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
                            <button
                              onClick={() => handleOrderChange(option.value)}
                              className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block w-full px-4 py-2 text-left text-sm hover:bg-gray-50')}
                            >
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
                  setSort({});
                  setPage(1);
                  setSearchParams({ page: '1' });
                }}
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-50"
                title="Clear sort"
              >
                Clear
              </button>
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>

            {/* Product grid only (no sidebar filters) */}
            <div className="">
              <ProductGrid products={(recommended && recommended.length > 0) ? recommended : products} status={status} page={page} />
            </div>
          </section>

          {/* Pagination */}
          {(!(recommended && recommended.length > 0)) && (
            <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <Pagination
                page={page}
                setPage={setPage}
                handlePage={handlePage}
                totalItems={totalItems}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


function ProductGrid({ products, status, page }) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-0 sm:px-6 sm:py-0 lg:max-w-7xl lg:px-8">
        {status === 'loading' ? (
          <div className="flex justify-center items-center py-20">
            <Grid
              height="80"
              width="80"
              color="rgb(34,197,94)"
              ariaLabel="grid-loading"
              radius="12.5"
              visible={true}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} linkState={{ from: 'home', page }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
