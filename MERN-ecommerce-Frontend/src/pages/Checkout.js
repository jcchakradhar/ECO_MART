import { Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteItemFromCartAsync,
  selectItems,
  updateCartAsync,
} from '../features/cart/cartSlice';
import { useForm } from 'react-hook-form';
import { updateUserAsync } from '../features/user/userSlice';
import { useState } from 'react';
import {
  createOrderAsync,
  selectCurrentOrder,
  selectStatus,
} from '../features/order/orderSlice';
import { selectUserInfo } from '../features/user/userSlice';
import { Grid } from 'react-loader-spinner';

function Checkout() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const user = useSelector(selectUserInfo);
  const items = useSelector(selectItems);
  const status = useSelector(selectStatus);
  const currentOrder = useSelector(selectCurrentOrder);

  const totalAmount = items.reduce(
    (amount, item) => item.product.discountPrice * item.quantity + amount,
    0
  );
  const totalItems = items.reduce((total, item) => item.quantity + total, 0);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const handleQuantity = (e, item) => {
    dispatch(updateCartAsync({ id: item.id, quantity: +e.target.value }));
  };

  const handleRemove = (e, id) => {
    dispatch(deleteItemFromCartAsync(id));
  };

  const handleAddress = (e) => {
    setSelectedAddress(user.addresses[e.target.value]);
  };

  const handlePayment = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleOrder = (e) => {
    if (selectedAddress && paymentMethod) {
      const order = {
        items,
        totalAmount,
        totalItems,
        user: user.id,
        paymentMethod,
        selectedAddress,
        status: 'pending',
      };
      dispatch(createOrderAsync(order));
    } else {
      alert('Please select an address and payment method.');
    }
  };

  // Redirects
  if (!items.length) return <Navigate to="/" replace />;
  if (currentOrder && currentOrder.paymentMethod === 'cash')
    return <Navigate to={`/order-success/${currentOrder.id}`} replace />;
  if (currentOrder && currentOrder.paymentMethod === 'card')
    return <Navigate to={`/stripe-checkout/`} replace />;

  return (
    <>
      {status === 'loading' ? (
        <Grid
          height="80"
          width="80"
          color="rgb(34,197,94)"
          ariaLabel="grid-loading"
          radius="12.5"
          visible={true}
        />
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
            {/* Address & Payment */}
            <div className="lg:col-span-3">
              <form
                className="bg-white/90 rounded-2xl shadow-xl px-5 py-10 mt-6"
                noValidate
                onSubmit={handleSubmit((data) => {
                  dispatch(
                    updateUserAsync({
                      ...user,
                      addresses: [...user.addresses, data],
                    })
                  );
                  reset();
                })}
              >
                <div className="space-y-10">
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-800">Shipping Address</h2>
                    <p className="mt-1 text-sm text-emerald-600">
                      Use a permanent address where you can receive mail.
                    </p>
                    <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-emerald-800">Full name</label>
                        <input
                          type="text"
                          {...register('name', { required: 'Name is required' })}
                          id="name"
                          className="mt-2 block w-full rounded-md border border-emerald-200 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-emerald-800">Email address</label>
                        <input
                          id="email"
                          {...register('email', { required: 'Email is required' })}
                          type="email"
                          className="mt-2 block w-full rounded-md border border-emerald-200 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-emerald-800">Phone</label>
                        <input
                          id="phone"
                          {...register('phone', { required: 'Phone is required' })}
                          type="tel"
                          className="mt-2 block w-full rounded-md border border-emerald-200 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="street" className="block text-sm font-semibold text-emerald-800">Street address</label>
                        <input
                          type="text"
                          {...register('street', { required: 'Street is required' })}
                          id="street"
                          className="mt-2 block w-full rounded-md border border-emerald-200 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.street && <p className="text-red-500 text-xs">{errors.street.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-sm font-semibold text-emerald-800">City</label>
                        <input
                          type="text"
                          {...register('city', { required: 'City is required' })}
                          id="city"
                          className="mt-2 block w-full rounded-md border border-emerald-200 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-semibold text-emerald-800">State / Province</label>
                        <input
                          type="text"
                          {...register('state', { required: 'State is required' })}
                          id="state"
                          className="mt-2 block w-full rounded-md border border-emerald-200 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.state && <p className="text-red-500 text-xs">{errors.state.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="pinCode" className="block text-sm font-semibold text-emerald-800">ZIP / Postal code</label>
                        <input
                          type="text"
                          {...register('pinCode', { required: 'Postal code is required' })}
                          id="pinCode"
                          className="mt-2 block w-full rounded-md border border-emerald-200 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.pinCode && <p className="text-red-500 text-xs">{errors.pinCode.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-x-6">
                    <button
                      type="button"
                      onClick={() => reset()}
                      className="text-sm font-semibold text-gray-900"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      Add Address
                    </button>
                  </div>
                </div>
              </form>

              {/* Existing Addresses */}
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-emerald-800">Choose Address</h2>
                <ul>
                  {user.addresses.map((address, index) => (
                    <li
                      key={index}
                      className="flex justify-between gap-x-6 px-5 py-4 border border-emerald-100 rounded-lg mb-3 bg-white/80"
                    >
                      <div className="flex gap-x-4">
                        <input
                          onChange={handleAddress}
                          name="address"
                          type="radio"
                          value={index}
                          className="h-4 w-4 border-emerald-300 text-emerald-600 focus:ring-emerald-600"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{address.name}</p>
                          <p className="text-xs text-gray-500">{address.street}, {address.city}, {address.state} - {address.pinCode}</p>
                          <p className="text-xs text-gray-500">Phone: {address.phone}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Methods */}
              <div className="mt-10">
                <fieldset>
                  <legend className="text-lg font-semibold text-emerald-800">Payment Methods</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-x-3">
                      <input
                        id="cash"
                        name="payments"
                        onChange={handlePayment}
                        value="cash"
                        type="radio"
                        checked={paymentMethod === 'cash'}
                        className="h-4 w-4 border-emerald-300 text-emerald-600 focus:ring-emerald-600"
                      />
                      <label htmlFor="cash" className="text-sm text-gray-900">Cash</label>
                    </div>
                    <div className="flex items-center gap-x-3">
                      <input
                        id="card"
                        onChange={handlePayment}
                        name="payments"
                        checked={paymentMethod === 'card'}
                        value="card"
                        type="radio"
                        className="h-4 w-4 border-emerald-300 text-emerald-600 focus:ring-emerald-600"
                      />
                      <label htmlFor="card" className="text-sm text-gray-900">Card Payment</label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

            {/* Cart & Summary */}
            <div className="lg:col-span-2">
              <div className="mx-auto mt-6 bg-white/90 rounded-2xl shadow-xl px-4 py-8">
                <h1 className="text-3xl font-bold text-emerald-800 mb-4">Your Cart</h1>
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-emerald-200">
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link to={`/product-detail/${item.product.id}`}>
                                {item.product.title}
                              </Link>
                            </h3>
                            <p className="ml-4">${item.product.discountPrice}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.product.brand}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="text-gray-500">
                            <label htmlFor="quantity" className="inline mr-2 text-sm font-medium text-gray-900">
                              Qty
                            </label>
                            <select
                              onChange={(e) => handleQuantity(e, item)}
                              value={item.quantity}
                              className="rounded border border-emerald-200 px-2 py-1"
                            >
                              {[1,2,3,4,5].map(qty => (
                                <option key={qty} value={qty}>{qty}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={(e) => handleRemove(e, item.id)}
                            type="button"
                            className="font-medium text-emerald-600 hover:text-emerald-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${totalAmount}</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
                    <p>Total Items</p>
                    <p>{totalItems}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleOrder}
                      className="w-full rounded-md bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
                    >
                      Order Now
                    </button>
                  </div>
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or{' '}
                      <Link to="/" className="font-medium text-emerald-600 hover:text-emerald-800">
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;
