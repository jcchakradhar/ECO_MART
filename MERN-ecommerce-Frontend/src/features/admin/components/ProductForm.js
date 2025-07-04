import { useDispatch, useSelector } from 'react-redux';
import {
  clearSelectedProduct,
  createProductAsync,
  fetchProductByIdAsync,
  selectBrands,
  selectCategories,
  selectProductById,
  updateProductAsync,
} from '../../product/productSlice';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import { useAlert } from 'react-alert';
import { 
  PhotoIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

function ProductForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const dispatch = useDispatch();
  const params = useParams();
  const selectedProduct = useSelector(selectProductById);
  const [openModal, setOpenModal] = useState(null);
  const alert = useAlert();

  const colors = [
    {
      name: 'White',
      class: 'bg-white',
      selectedClass: 'ring-gray-400',
      id: 'white',
    },
    {
      name: 'Gray',
      class: 'bg-gray-200',
      selectedClass: 'ring-gray-400',
      id: 'gray',
    },
    {
      name: 'Black',
      class: 'bg-gray-900',
      selectedClass: 'ring-gray-900',
      id: 'black',
    },
  ];

  const sizes = [
    { name: 'XXS', inStock: true, id: 'xxs' },
    { name: 'XS', inStock: true, id: 'xs' },
    { name: 'S', inStock: true, id: 's' },
    { name: 'M', inStock: true, id: 'm' },
    { name: 'L', inStock: true, id: 'l' },
    { name: 'XL', inStock: true, id: 'xl' },
    { name: '2XL', inStock: true, id: '2xl' },
    { name: '3XL', inStock: true, id: '3xl' },
  ];

  useEffect(() => {
    if (params.id) {
      dispatch(fetchProductByIdAsync(params.id));
    } else {
      dispatch(clearSelectedProduct());
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    if (selectedProduct && params.id) {
      setValue('title', selectedProduct.title);
      setValue('description', selectedProduct.description);
      setValue('price', selectedProduct.price);
      setValue('discountPercentage', selectedProduct.discountPercentage);
      setValue('thumbnail', selectedProduct.thumbnail);
      setValue('stock', selectedProduct.stock);
      setValue('image1', selectedProduct.images[0]);
      setValue('image2', selectedProduct.images[1]);
      setValue('image3', selectedProduct.images[2]);
      setValue('brand', selectedProduct.brand);
      setValue('category', selectedProduct.category);
      setValue('highlight1', selectedProduct.highlights[0]);
      setValue('highlight2', selectedProduct.highlights[1]);
      setValue('highlight3', selectedProduct.highlights[2]);
      setValue('highlight4', selectedProduct.highlights[3]);
      setValue(
        'sizes',
        selectedProduct.sizes.map((size) => size.id)
      );
      setValue(
        'colors',
        selectedProduct.colors.map((color) => color.id)
      );
    }
  }, [selectedProduct, params.id, setValue]);

  const handleDelete = () => {
    const product = { ...selectedProduct };
    product.deleted = true;
    dispatch(updateProductAsync(product));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {params.id ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {params.id 
              ? 'Update product information and manage inventory'
              : 'Create a new product for your catalog'
            }
          </p>
        </div>

        {/* Deleted Product Alert */}
        {selectedProduct && selectedProduct.deleted && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Product Deleted
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>This product has been marked as deleted and is not visible to customers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form
          noValidate
          onSubmit={handleSubmit((data) => {
            console.log(data);
            const product = { ...data };
            product.images = [
              product.image1,
              product.image2,
              product.image3,
              product.thumbnail,
            ];
            product.highlights = [
              product.highlight1,
              product.highlight2,
              product.highlight3,
              product.highlight4,
            ];
            product.rating = 0;
            if (product.colors) {
              product.colors = product.colors.map((color) =>
                colors.find((clr) => clr.id === color)
              );
            }
            if (product.sizes) {
              product.sizes = product.sizes.map((size) =>
                sizes.find((sz) => sz.id === size)
              );
            }

            delete product['image1'];
            delete product['image2'];
            delete product['image3'];
            product.price = +product.price;
            product.stock = +product.stock;
            product.discountPercentage = +product.discountPercentage;
            console.log(product);
            if (params.id) {
              product.id = params.id;
              product.rating = selectedProduct.rating || 0;
              dispatch(updateProductAsync(product));
              alert.success('Product Updated');
              reset();
            } else {
              dispatch(createProductAsync(product));
              alert.success('Product Created');
              reset();
            }
          })}
          className="space-y-8"
        >
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="mt-1 text-sm text-gray-600">Essential product details</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Product name is required' })}
                  id="title"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Enter product name"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Describe your product in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Brand and Category */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <select
                    {...register('brand', { required: 'Brand is required' })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.value} value={brand.value}>
                        {brand.label}
                      </option>
                    ))}
                  </select>
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing and Inventory */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h2>
              <p className="mt-1 text-sm text-gray-600">Set pricing and stock information</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 1, message: 'Price must be at least $1' },
                      max: { value: 10000, message: 'Price cannot exceed $10,000' }
                    })}
                    id="price"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%) *
                  </label>
                  <input
                    type="number"
                    {...register('discountPercentage', {
                      required: 'Discount percentage is required',
                      min: { value: 0, message: 'Discount cannot be negative' },
                      max: { value: 100, message: 'Discount cannot exceed 100%' }
                    })}
                    id="discountPercentage"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="0"
                  />
                  {errors.discountPercentage && (
                    <p className="mt-1 text-sm text-red-600">{errors.discountPercentage.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    {...register('stock', {
                      required: 'Stock is required',
                      min: { value: 0, message: 'Stock cannot be negative' }
                    })}
                    id="stock"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
              <p className="mt-1 text-sm text-gray-600">Add high-quality images of your product</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Thumbnail */}
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image (Thumbnail) *
                </label>
                <input
                  type="text"
                  {...register('thumbnail', { required: 'Thumbnail is required' })}
                  id="thumbnail"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
                {errors.thumbnail && (
                  <p className="mt-1 text-sm text-red-600">{errors.thumbnail.message}</p>
                )}
              </div>

              {/* Additional Images */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[1, 2, 3].map((num) => (
                  <div key={num}>
                    <label htmlFor={`image${num}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Image {num} *
                    </label>
                    <input
                      type="text"
                      {...register(`image${num}`, { required: `Image ${num} is required` })}
                      id={`image${num}`}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors[`image${num}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`image${num}`].message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
              <p className="mt-1 text-sm text-gray-600">Select available colors and sizes</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Colors
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {colors.map((color) => (
                    <label key={color.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('colors')}
                        value={color.id}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Sizes
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {sizes.map((size) => (
                    <label key={size.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('sizes')}
                        value={size.id}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{size.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Highlights */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Product Highlights</h2>
              <p className="mt-1 text-sm text-gray-600">Key features and benefits</p>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num}>
                  <label htmlFor={`highlight${num}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Highlight {num}
                  </label>
                  <input
                    type="text"
                    {...register(`highlight${num}`)}
                    id={`highlight${num}`}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder={`Enter highlight ${num}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-3">
              {selectedProduct && !selectedProduct.deleted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Delete Product
                </button>
              )}

              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                {params.id ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {selectedProduct && (
          <Modal
            title={`Delete ${selectedProduct.title}`}
            message="Are you sure you want to delete this Product?"
            dangerOption="Delete"
            cancelOption="Cancel"
            dangerAction={handleDelete}
            cancelAction={() => setOpenModal(null)}
            showModal={openModal}
          />
        )}
      </div>
    </div>
  );
}

export default ProductForm;
