import React, { useState, Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProductsByFiltersAsync,
  selectAllProducts,
  selectProductListStatus,
  selectTotalItems,
} from '../productSlice';
import { Menu, Transition } from '@headlessui/react';
import { StarIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ITEMS_PER_PAGE } from '../../../app/constants';
import Pagination from '../../common/Pagination';
import { Grid } from 'react-loader-spinner';
import sustainabilityImage from '../../../assests/generated-image.png';
import ProductCard from './ProductCard';

const sortOptions = [
  { name: 'Best Rating', sort: 'rating', order: 'desc', current: false },
  { name: 'Price: Low to High', sort: 'discountPrice', order: 'asc', current: false },
  { name: 'Price: High to Low', sort: 'discountPrice', order: 'desc', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Hero Banner Component
function HeroBanner({ totalItems }) {
  return (
    <div className="relative w-full">
      {/* Banner Image */}
      <div className="w-full h-[40vh] sm:h-[45vh] lg:h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-100 to-yellow-100">
        <img
          src={sustainabilityImage}
          alt="Shop sustainably"
          className="object-contain h-full w-auto"
        />
      </div>
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/0 pointer-events-none" />
      {/* Headline & Count */}
      <div className="absolute inset-0 flex flex-col justify-end pb-10 px-6 sm:px-10 lg:px-20">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-md">
          Explore Earth-Friendly Products
        </h1>
        <p className="mt-2 text-lg text-gray-100 drop-shadow-sm">
          {totalItems} items curated for conscious shoppers
        </p>
      </div>
    </div>
  );
}

export default function ProductList() {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const totalItems = useSelector(selectTotalItems);
  const status = useSelector(selectProductListStatus);
  // Filters removed: we no longer use categories/brands in the UI
  const [sort, setSort] = useState({});
  const [page, setPage] = useState(1);


  const handleSort = (e, option) => {
    const sort = { _sort: option.sort, _order: option.order };
    setSort(sort);
  };

  const handlePage = (page) => {
    setPage(page);
  };

  useEffect(() => {
    const pagination = { _page: page, _limit: ITEMS_PER_PAGE };
    // Send empty filter since filters UI is removed
    dispatch(fetchProductsByFiltersAsync({ filter: {}, sort, pagination }));
  }, [dispatch, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [totalItems, sort]);

  // Removed fetching brands/categories since not used in UI

  return (
    <div className="bg-white min-h-screen">
      <div>
        {/* Filters removed from UI */}

        {/* Large Amazon-style Hero Banner */}
        <HeroBanner totalItems={totalItems} />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Sort/Filter Header - Now below the banner */}
          <div className="flex items-center justify-between bg-white border-b border-gray-200 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                All Products
              </h2>
              <p className="text-sm text-gray-600">
                {totalItems} results
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort Menu */}
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2 bg-white hover:bg-gray-50">
                    Sort
                    <ChevronDownIcon
                      className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <Menu.Item key={option.name}>
                          {({ active }) => (
                            <button
                              onClick={(e) => handleSort(e, option)}
                              className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block w-full px-4 py-2 text-left text-sm hover:bg-gray-50'
                              )}
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

              {/* Filters button removed */}
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>

            {/* Product grid only (no sidebar filters) */}
            <div className="">
              <ProductGrid products={products} status={status} />
            </div>
          </section>

          {/* Pagination */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <Pagination
              page={page}
              setPage={setPage}
              handlePage={handlePage}
              totalItems={totalItems}
            />
          </div>
        </main>
      </div>
    </div>
  );
}


function ProductGrid({ products, status }) {
  // Function to generate random carbon rating for demo purposes
  const getCarbonRating = () => {
    const ratings = ['A+', 'A', 'B+', 'B', 'C+', 'C'];
    return ratings[Math.floor(Math.random() * ratings.length)];
  };

  const getCarbonColor = (rating) => {
    switch (rating) {
      case 'A+': return 'bg-green-600 text-white';
      case 'A': return 'bg-green-500 text-white';
      case 'B+': return 'bg-yellow-500 text-white';
      case 'B': return 'bg-yellow-600 text-white';
      case 'C+': return 'bg-orange-500 text-white';
      case 'C': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
