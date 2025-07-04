import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { resetCartAsync } from "../features/cart/cartSlice";
import { useDispatch } from "react-redux";
import { resetOrder } from "../features/order/orderSlice";
import { CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

function OrderSuccessPage() {
  const params = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetCartAsync());
    dispatch(resetOrder());
  }, [dispatch]);

  return (
    <>
      {!params.id && <Navigate to="/" replace={true} />}
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 px-6 py-24 sm:py-32 lg:px-8">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/30 px-8 py-12 max-w-lg w-full text-center">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="h-16 w-16 text-emerald-500" />
          </div>
          <p className="text-lg font-semibold text-emerald-700">Order Successfully Placed</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Order Number <span className="text-emerald-600">#{params?.id}</span>
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Thank you for shopping sustainably!<br />
            You can check your order status in <span className="font-semibold text-emerald-700">My Account &rarr; My Orders</span>.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/"
              className="inline-flex items-center rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go back home
            </Link>
          </div>
          <div className="mt-8 text-xs text-emerald-700">
            🌱 Every order helps us build a greener future.
          </div>
        </div>
      </main>
    </>
  );
}

export default OrderSuccessPage;
