import { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteItemFromCartAsync,
  selectCartLoaded,
  selectCartStatus,
  selectItems,
  updateCartAsync,
} from './cartSlice';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Grid } from 'react-loader-spinner';
import Modal from '../common/Modal';
import { 
  TrashIcon, 
  ShoppingBagIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector(selectItems);
  const status = useSelector(selectCartStatus);
  const cartLoaded = useSelector(selectCartLoaded);
  const [openModal, setOpenModal] = useState(null);

  const totalAmount = items.reduce(
    (amount, item) => item.product.discountPrice * item.quantity + amount,
    0
  );
  const totalItems = items.reduce((total, item) => item.quantity + total, 0);

  // Calculate savings
  const totalOriginalPrice = items.reduce(
    (amount, item) => item.product.price * item.quantity + amount,
    0
  );
  const totalSavings = totalOriginalPrice - totalAmount;

  const handleQuantity = (e, item) => {
    dispatch(updateCartAsync({id: item.id, quantity: +e.target.value}));
  };

  const handleRemove = (e, id) => {
    dispatch(deleteItemFromCartAsync(id));
  };

  // Generate random carbon rating for demo
  const getCarbonRating = () => {
    const ratings = ['A+', 'A', 'B+', 'B', 'C+', 'C'];
    return ratings[Math.floor(Math.random() * ratings.length)];
  };

  const getCarbonColor = (rating) => {
    switch (rating) {
      case 'A+': return 'bg-green-500 text-white';
      case 'A': return 'bg-green-400 text-white';
      case 'B+': return 'bg-yellow-400 text-gray-900';
      case 'B': return 'bg-yellow-500 text-gray-900';
      case 'C+': return 'bg-orange-400 text-white';
      case 'C': return 'bg-red-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <>
      {!items.length && cartLoaded && <Navigate to="/" replace={true}></Navigate>}

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 opacity-10 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-200 opacity-10 rounded-full translate-x-40 translate-y-40 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
                  Your Eco Cart
                </h1>
                <p className="mt-2 text-emerald-700">
                  🌱 {totalItems} sustainable items ready for checkout
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl px-6 py-4 border border-emerald-200/30 shadow-lg">
                  <div className="text-center">
                    <ShoppingBagIcon className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm text-emerald-700 font-medium">Cart Total</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Cart Items */}
            <div className="lg:col-span-7">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/30 p-6">
                {status === 'loading' ? (
                  <div className="flex justify-center items-center py-20">
                    <Grid
                      height="80"
                      width="80"
                      color="rgb(16, 185, 129)"
                      ariaLabel="grid-loading"
                      radius="12.5"
                      wrapperStyle={{}}
                      wrapperClass=""
                      visible={true}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => {
                      const carbonRating = getCarbonRating();
                      return (
                        <div key={item.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-start space-x-4">
                            {/* Product Image */}
                            <div className="relative flex-shrink-0">
                              <div className="h-32 w-32 overflow-hidden rounded-xl border-2 border-emerald-200">
                                <img
                                  src={item.product.thumbnail}
                                  alt={item.product.title}
                                  className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              {/* Carbon Rating Badge */}
                              <div className="absolute -top-2 -right-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold shadow-lg ${getCarbonColor(carbonRating)}`}>
                                  🌍 {carbonRating}
                                </span>
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                                    <Link to={`/product-detail/${item.product.id}`} className="hover:text-emerald-600 transition-colors">
                                      {item.product.title}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-emerald-600 font-medium mb-2">
                                    by {item.product.brand}
                                  </p>
                                  <div className="flex items-center space-x-4 mb-4">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        ${item.product.discountPrice}
                                      </span>
                                      {item.product.price !== item.product.discountPrice && (
                                        <span className="text-sm text-gray-400 line-through">
                                          ${item.product.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Quantity and Actions */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium text-emerald-800">
                                      Qty:
                                    </label>
                                    <select
                                      id={`quantity-${item.id}`}
                                      onChange={(e) => handleQuantity(e, item)}
                                      value={item.quantity}
                                      className="rounded-lg border border-emerald-200 bg-white/70 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="text-sm text-emerald-700">
                                    Subtotal: <span className="font-semibold">${(item.product.discountPrice * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setOpenModal(item.id)}
                                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="text-sm font-medium">Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Modal for item removal */}
                          <Modal
                            title={`Remove ${item.product.title}`}
                            message="Are you sure you want to remove this item from your cart?"
                            dangerOption="Remove"
                            cancelOption="Cancel"
                            dangerAction={(e) => handleRemove(e, item.id)}
                            cancelAction={() => setOpenModal(null)}
                            showModal={openModal === item.id}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/30 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-emerald-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-emerald-900">${totalAmount.toFixed(2)}</span>
                  </div>
                  
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-700">You Save</span>
                      <span className="font-medium text-green-600">-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  
                  <div className="border-t border-emerald-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-emerald-900">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-semibold text-emerald-800 mb-3">Your Impact</h3>
                  <div className="space-y-2 text-xs text-emerald-700">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 mr-2" />
                      Carbon-conscious shopping choices
                    </div>
                    <div className="flex items-center">
                      <TruckIcon className="h-4 w-4 text-emerald-600 mr-2" />
                      Free eco-friendly shipping
                    </div>
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 text-emerald-600 mr-2" />
                      30-day sustainable return policy
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Proceed to Checkout
                </Link>

                {/* Continue Shopping */}
                <div className="mt-6 text-center">
                  <Link
                    to="/"
                    className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
