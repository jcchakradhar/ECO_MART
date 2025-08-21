import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';
import { RadioGroup } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductByIdAsync,
  selectProductById,
  selectProductListStatus,
} from '../productSlice';
import { useParams, Link, useLocation } from 'react-router-dom';
import { addToCartAsync, selectItems } from '../../cart/cartSlice';
import { selectLoggedInUser } from '../../auth/authSlice';
import { useAlert } from 'react-alert';
import { Grid } from 'react-loader-spinner';
import {
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import RatingBadge from '../../common/RatingBadge';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Friendly labels for odd/DB-driven keys
const DISPLAY_LABELS = {
  category_name: 'Category',
  categoryname: 'Category',

  seller_name: 'Seller Name',
  sellername: 'Seller Name',
  seller_address: 'Seller Address',
  selleraddress: 'Seller Address',

  // Carbon footprint variants
  carbonfootprintkgco2e: 'Carbon Footprint (kg CO2e)',
  carbonfootprintkgco2: 'Carbon Footprint (kg CO2e)',
  carbon_footprint_kg_co2e: 'Carbon Footprint (kg CO2e)',
  carbonfootprint: 'Carbon Footprint (kg CO2e)',
  // Handles "Carbon_ Footprint_kg C O2e"
  carbonfootprintkgco2ealt: 'Carbon Footprint (kg CO2e)',

  // Water usage variants
  waterusagelitres: 'Water Usage (litres)',
  waterusageliter: 'Water Usage (litres)',
  water_usage_litres: 'Water Usage (litres)',
  waterusage: 'Water Usage (litres)',

  countryoforigin: 'Country of Origin',
};

const normalizeKey = (k) => String(k || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const prettifyKey = (k) =>
  String(k || '')
    .replace(/[_\s]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const labelFor = (key, explicit) => {
  if (explicit) return explicit;
  const norm = normalizeKey(key);
  const mapped = DISPLAY_LABELS[norm];
  return mapped || prettifyKey(key);
};

export default function ProductDetail() {
  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [selectedImage, setSelectedImage] = useState(0);
  const items = useSelector(selectItems);
  const product = useSelector(selectProductById);
  const dispatch = useDispatch();
  const params = useParams();
  const alert = useAlert();
  const location = useLocation();
  const status = useSelector(selectProductListStatus);

  // Normalize prices to avoid duplicated currency symbols
  const parseMoney = (v) => {
    if (v === undefined || v === null) return null;
    const num = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.]/g, '')) : Number(v);
    return Number.isFinite(num) ? num : null;
  };
  const priceVal = parseMoney(product?.price);
  const discountVal = parseMoney(product?.discountPrice);
  const displayPrice = discountVal ?? priceVal ?? 0;

  // Prefer a short description if available; fallback to full description
  const shortDescription = (
    product?.shortDescription ||
    product?.short_desc ||
    product?.short_description ||
    product?.Short_Description ||
    product?.shortDesc ||
    product?.ShortDesc ||
    product?.summary ||
    product?.Summary ||
    product?.description ||
    ''
  );

  // Build breadcrumbs dynamically if not provided from API
  const fromSearch = location.state?.from === 'search';
  const fromHome = location.state?.from === 'home';
  const searchQuery = location.state?.q;
  const searchPage = location.state?.page || 1;
  const homePage = location.state?.page || 1;

  const truncate = (str, n = 30) => {
    if (!str) return '';
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  };

  const computedBreadcrumbs = product && (!product.breadcrumbs || product.breadcrumbs.length === 0)
    ? (
      fromSearch
        ? [
          { id: 'search', name: truncate(searchQuery) || 'Search', href: `/search-results?q=${encodeURIComponent(searchQuery || '')}&page=${encodeURIComponent(searchPage)}` },
          { id: 'item', name: product?.brand || product?.title }
        ]
        : fromHome
          ? [
            { id: 'home', name: 'Home', href: `/?page=${encodeURIComponent(homePage)}` },
            { id: 'item', name: product?.brand || product?.title }
          ]
          : [
            { id: 'home', name: 'Home', href: '/' },
            ...(product.category ? [{ id: 'category', name: product.category, href: `/search-results?q=${encodeURIComponent(product.category)}` }] : []),
            ...(product.brand ? [{ id: 'brand', name: product.brand, href: `/search-results?q=${encodeURIComponent(product.brand)}` }] : []),
            { id: 'item', name: product?.title }
          ]
    )
    : product?.breadcrumbs;

  const handleCart = (e) => {
    e.preventDefault();
    if (items.findIndex((item) => item.product.id === product.id) < 0) {
      const newItem = {
        product: product.id,
        quantity: 1,
      };
      if (selectedColor) {
        newItem.color = selectedColor;
      }
      if (selectedSize) {
        newItem.size = selectedSize;
      }
      dispatch(addToCartAsync({ item: newItem, alert }));
    } else {
      alert.error('Item Already added');
    }
  };

  useEffect(() => {
    dispatch(fetchProductByIdAsync(params.id));
  }, [dispatch, params.id]);

  // Ensure we start at the top when navigating to a product detail
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [params.id]);

  useEffect(() => {
    if (product && product.images) {
      setSelectedImage(0);
    }
  }, [product]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {status === 'loading' ? (
        <div className="flex justify-center items-center min-h-screen">
          <Grid
            height="80"
            width="80"
            color="rgb(79, 70, 229)"
            ariaLabel="grid-loading"
            radius="12.5"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : null}

      {product && (
        <div className="bg-white">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-200">
            <ol className="mx-auto flex max-w-7xl items-center space-x-2 px-4 py-4 sm:px-6 lg:px-8">
              {(computedBreadcrumbs || []).map((breadcrumb, idx) => (
                <li key={breadcrumb.id || `${breadcrumb.name}-${idx}`}>
                  <div className="flex items-center">
                    {breadcrumb.href ? (
                      <Link
                        to={breadcrumb.href}
                        className="mr-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {breadcrumb.name}
                      </Link>
                    ) : (
                      <span className="mr-2 text-sm font-medium text-gray-700">
                        {breadcrumb.name}
                      </span>
                    )}
                    {idx < (computedBreadcrumbs?.length || 0) - 1 && (
                      <svg
                        width={16}
                        height={20}
                        viewBox="0 0 16 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="h-5 w-4 text-gray-400"
                      >
                        <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                      </svg>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          {/* Main Product Content */}
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">

              {/* Image Gallery */}
              <div className="flex flex-col-reverse">
                {/* Thumbnails */}
                <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                  <div className="grid grid-cols-4 gap-6" aria-orientation="horizontal" role="tablist">
                    {product.images?.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 ${selectedImage === index ? 'ring-2 ring-blue-500' : ''
                          }`}
                      >
                        <span className="sr-only">Image {index + 1}</span>
                        <span className="absolute inset-0 overflow-hidden rounded-md">
                          <img src={image} alt="" className="h-full w-full object-cover object-center" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Image with Sustainability Badges */}
                <div className="aspect-h-1 aspect-w-1 w-full relative">
                  {(product?.Eco_Rating || product?.Water_Rating) && (
                    <div className="absolute top-2 left-2 z-10 flex flex-row items-start gap-1">
                      {product?.Eco_Rating && (
                        <RatingBadge kind="eco" grade={product.Eco_Rating} size="lg" />
                      )}
                      {product?.Water_Rating && (
                        <RatingBadge kind="water" grade={product.Water_Rating} size="lg" />
                      )}
                    </div>
                  )}
                  <img
                    src={
                      product.images?.[selectedImage] ||
                      product.imgUrl ||
                      product.thumbnail ||
                      'https://via.placeholder.com/800'
                    }
                    alt={product.title || 'Product image'}
                    className="h-full w-full object-cover object-center sm:rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                {/* Product Title */}
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {product.title}
                </h1>

                {/* Brand */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    Brand: <span className="font-medium text-blue-600">{product.brand}</span>
                  </p>
                </div>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-center space-x-3">
                    <p className="text-3xl font-bold text-red-600">
                      ${displayPrice}
                    </p>
                    {product.discountPercentage > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Inclusive of all taxes
                  </p>
                </div>

                {/* Reviews */}
                <div className="mt-6">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={classNames(
                            product.rating > rating
                              ? 'text-yellow-400'
                              : 'text-gray-200',
                            'h-5 w-5 flex-shrink-0'
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-500">
                      {product.rating} out of 5 stars
                    </p>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mt-6">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Product Form */}
                <form className="mt-10">
                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Color</h3>
                      <RadioGroup
                        value={selectedColor}
                        onChange={setSelectedColor}
                        className="mt-4"
                      >
                        <RadioGroup.Label className="sr-only">
                          Choose a color
                        </RadioGroup.Label>
                        <div className="flex items-center space-x-3">
                          {product.colors.map((color) => (
                            <RadioGroup.Option
                              key={color.name}
                              value={color}
                              className={({ active, checked }) =>
                                classNames(
                                  color.selectedClass,
                                  active && checked ? 'ring ring-offset-1' : '',
                                  !active && checked ? 'ring-2' : '',
                                  'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none'
                                )
                              }
                            >
                              <RadioGroup.Label as="span" className="sr-only">
                                {color.name}
                              </RadioGroup.Label>
                              <span
                                aria-hidden="true"
                                className={classNames(
                                  color.class,
                                  'h-8 w-8 rounded-full border border-black border-opacity-10'
                                )}
                              />
                            </RadioGroup.Option>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mt-10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Size</h3>
                        <a
                          href="#"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Size guide
                        </a>
                      </div>

                      <RadioGroup
                        value={selectedSize}
                        onChange={setSelectedSize}
                        className="mt-4"
                      >
                        <RadioGroup.Label className="sr-only">
                          Choose a size
                        </RadioGroup.Label>
                        <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
                          {product.sizes.map((size) => (
                            <RadioGroup.Option
                              key={size.name}
                              value={size}
                              disabled={!size.inStock}
                              className={({ active }) =>
                                classNames(
                                  size.inStock
                                    ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                                    : 'cursor-not-allowed bg-gray-50 text-gray-200',
                                  active ? 'ring-2 ring-blue-500' : '',
                                  'group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 sm:py-6'
                                )
                              }
                            >
                              {({ active, checked }) => (
                                <>
                                  <RadioGroup.Label as="span">
                                    {size.name}
                                  </RadioGroup.Label>
                                  {size.inStock ? (
                                    <span
                                      className={classNames(
                                        active ? 'border' : 'border-2',
                                        checked
                                          ? 'border-blue-500'
                                          : 'border-transparent',
                                        'pointer-events-none absolute -inset-px rounded-md'
                                      )}
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <span
                                      aria-hidden="true"
                                      className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                                    >
                                      <svg
                                        className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                        stroke="currentColor"
                                      >
                                        <line
                                          x1={0}
                                          y1={100}
                                          x2={100}
                                          y2={0}
                                          vectorEffect="non-scaling-stroke"
                                        />
                                      </svg>
                                    </span>
                                  )}
                                </>
                              )}
                            </RadioGroup.Option>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <div className="mt-10 flex flex-col space-y-4">
                    <button
                      onClick={handleCart}
                      type="submit"
                      disabled={product.stock === 0}
                      className={`flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${product.stock > 0
                        ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>

                    {/* Secondary Actions */}
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        className="flex-1 bg-white border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {/* <HeartIcon className="h-5 w-5 mr-2" /> */}
                       Buy Now
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-white border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ShareIcon className="h-5 w-5 mr-2" />
                        Share
                      </button>
                    </div>
                  </div>
                </form>

                {/* Product Description (short) */}
                <div className="mt-10 border-t border-gray-200 pt-10">
                  <h3 className="text-lg font-medium text-gray-900">Product Description</h3>
                  <div className="mt-4 space-y-6">
                    <p className="text-sm text-gray-600">{shortDescription || 'No description available.'}</p>
                  </div>
                </div>

                {/* Highlights */}
                {product.highlights && product.highlights.length > 0 && (
                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h3 className="text-lg font-medium text-gray-900">Highlights</h3>
                    <div className="mt-4">
                      <ul className="list-disc space-y-2 pl-4 text-sm">
                        {product.highlights.map((highlight, index) => (
                          <li key={index} className="text-gray-600">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Product Details */}
                <div className="mt-10 border-t border-gray-200 pt-10">
                  <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {
                      (() => {
                        const entries = [];

                        const add = (key, label, value) => {
                          if (value === undefined || value === null) return;
                          const displayLabel = labelFor(key, label);
                          if (!displayLabel || /^\d+$/.test(displayLabel)) return;

                          if (Array.isArray(value)) {
                            if (value.length === 0) return;
                            const joined = value
                              .map((v) => (typeof v === 'object' && v !== null ? (v.name || JSON.stringify(v)) : String(v)))
                              .join(', ');
                            if (!joined) return;
                            entries.push({ key, label: displayLabel, value: joined });
                          } else if (typeof value === 'object') {
                            // Skip nested objects by default
                            return;
                          } else {
                            const str = String(value).trim();
                            if (!str) return;
                            entries.push({ key, label: displayLabel, value: str });
                          }
                        };

                        // Known/primary fields
                        add('brand', 'Brand', product.brand);

                        // Category (support multiple variants)
                        add('category_name', 'Category', product['Category_name'] || product.categoryName || product.category);

                        // Seller Details (merge variants)
                        const sellerName =
                          product.sellerName ||
                          product.seller?.name ||
                          product['Seller_name'];
                        const sellerAddress =
                          product.sellerAddress ||
                          product.seller?.address ||
                          product.seller?.location ||
                          product['Seller_address'];
                        if (sellerName || sellerAddress) {
                          entries.push({
                            key: 'sellerDetails',
                            label: 'Seller Details',
                            type: 'seller',
                            value: { name: sellerName || '', address: sellerAddress || '' }
                          });
                        }

                        // Common attributes
                        add('dimensions', 'Dimensions', product.dimensions);
                        add('material', 'Material', product.material);
                        add('sku', 'SKU', product.sku);
                        add('model', 'Model', product.model);
                        add('weight', 'Weight', product.weight);
                        add('warranty', 'Warranty', product.warranty);
                        add('countryOfOrigin', 'Country of Origin', product.countryOfOrigin);
                        add('colors', 'Colors', product.colors?.map(c => c?.name ?? c));
                        add('sizes', 'Sizes', product.sizes?.map(s => s?.name ?? s));

                        // Sustainability metrics (normalize odd keys)
                        const carbonValue =
                          product['Carbon_ Footprint_kg C O2e'] ??
                          product['Carbon_Footprint_kg_CO2e'] ??
                          product['Carbon_Footprint_kgCO2e'] ??
                          product['CarbonFootprintKgCO2e'] ??
                          product['carbonFootprint'] ??
                          product['Carbon_Footprint'];
                        add('Carbon_Footprint_kg_CO2e', 'Carbon Footprint (kg CO2e)', carbonValue);

                        const waterUsageValue =
                          product['Water_ Usage_ Litres'] ??
                          product['Water_Usage_Litres'] ??
                          product['WaterUsageLitres'] ??
                          product['waterUsage'] ??
                          product['water_usage'];
                        add('Water_Usage_Litres', 'Water Usage (litres)', waterUsageValue);

                        // Dynamic inclusion of other primitive fields (with exclusions)
                        const shownKeys = new Set(entries.map(e => e.key));
                        const exclude = new Set([
                          'id', '_id', 'productId', 'product_id', 'title',
                          'description', 'shortDescription', 'short_desc', 'short_description',
                          'Short_Description', 'shortDesc', 'ShortDesc', 'summary', 'Summary',
                          'description_short', 'desc_short',
                          'price', 'discountPrice', 'discountPercentage',
                          'rating', 'ratingCount', 'rating_count', 'reviews', 'stars',
                          'images', 'thumbnail', 'imgUrl', 'image', 'imageUrl',
                          'productUrl', 'productURL', 'url',
                          'breadcrumbs', 'highlights', 'createdAt', 'updatedAt', '__v', 'deleted',
                          'isBestSeller', 'isBestSellar', 'isbestsellar',
                          // category variants (avoid dup)
                          'category', 'categoryName', 'Category_name',
                          // ratings
                          'Eco_Rating', 'Water_Rating',
                          // sustainability (avoid dup)
                          'carbonFootprint', 'Carbon_Footprint', 'Carbon_Footprint_kg_CO2e', 'Carbon_Footprint_kgCO2e', 'Carbon_ Footprint_kg C O2e',
                          'waterUsage', 'water_usage', 'Water_Usage_Litres', 'Water_ Usage_ Litres',
                          // seller variants (avoid dup)
                          'stock', 'sellerName', 'sellerAddress', 'Seller_name', 'Seller_address', 'seller'
                        ]);

                        Object.keys(product || {}).forEach((k) => {
                          if (shownKeys.has(k) || exclude.has(k)) return;
                          const v = product[k];
                          if (v === undefined || v === null) return;
                          if (typeof v === 'object') return; // skip complex objects
                          add(k, undefined, v); // let labelFor prettify/match DISPLAY_LABELS
                        });

                        return entries.map((e) => (
                          <div key={e.key} className="bg-gray-50 px-4 py-3 rounded-lg">
                            <dt className="text-sm font-medium text-gray-500">{e.label}</dt>
                            {e.type === 'seller' ? (
                              <dd className="mt-1 text-sm text-gray-900 break-words space-y-1">
                                {e.value?.name ? (<div>{e.value.name}</div>) : null}
                                {e.value?.address ? (<div className="text-gray-700">{e.value.address}</div>) : null}
                              </dd>
                            ) : (
                              <dd className="mt-1 text-sm text-gray-900 break-words">{e.value}</dd>
                            )}
                          </div>
                        ));
                      })()
                    }
                  </div>
                </div>

                {/* Delivery & Services */}
                <div className="mt-10 border-t border-gray-200 pt-10">
                  <h3 className="text-lg font-medium text-gray-900">Delivery & Services</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm text-gray-600">Free delivery on orders over $50</span>
                    </div>
                    <div className="flex items-center">
                      <ArrowPathIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm text-gray-600">30-day return policy</span>
                    </div>
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm text-gray-600">2-year warranty included</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}