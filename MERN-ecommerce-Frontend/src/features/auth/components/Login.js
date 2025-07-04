import { useSelector, useDispatch } from 'react-redux';
import { selectError, selectLoggedInUser } from '../authSlice';
import { Link, Navigate } from 'react-router-dom';
import { loginUserAsync } from '../authSlice';
import { useForm } from 'react-hook-form';
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Login() {
  const dispatch = useDispatch();
  const error = useSelector(selectError);
  const user = useSelector(selectLoggedInUser);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <>
      {user && <Navigate to="/" replace={true}></Navigate>}
      
      {/* Sustainability-themed Background */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 opacity-20 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-200 opacity-20 rounded-full translate-x-40 translate-y-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-200 opacity-15 rounded-full -translate-x-32 -translate-y-32 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <img
                className="h-12 w-auto filter brightness-0 invert"
                src="/ecommerce.png"
                alt="EcoMart"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-emerald-700">
              Sign in to your sustainable shopping account
            </p>
          </div>

          {/* Login Form Card */}
          <div className="mt-8 bg-white/80 backdrop-blur-lg py-8 px-6 shadow-2xl rounded-2xl border border-emerald-200/30">
            <form
              noValidate
              onSubmit={handleSubmit((data) => {
                dispatch(
                  loginUserAsync({ email: data.email, password: data.password })
                );
              })}
              className="space-y-6"
            >
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold leading-6 text-emerald-800 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    type="email"
                    placeholder="Enter your email"
                    className="block w-full pl-10 pr-3 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold leading-6 text-emerald-800 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    id="password"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-12 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-emerald-500 hover:text-emerald-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-emerald-500 hover:text-emerald-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-emerald-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">❌</span>
                    {error.message || error}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <UserIcon className="h-5 w-5 text-emerald-200 group-hover:text-emerald-100" />
                  </span>
                  Sign In to EcoMart
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-emerald-600">New to sustainable shopping?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/signup"
                  className="w-full flex justify-center py-3 px-4 border border-emerald-300 rounded-xl text-sm font-semibold text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                >
                  Create Your Eco Account
                </Link>
              </div>
            </div>

            {/* Sustainability Message */}
            <div className="mt-6 text-center">
              <p className="text-xs text-emerald-600">
                🌱 Join thousands of eco-conscious shoppers making a difference
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-emerald-700">
              By signing in, you agree to our commitment to{' '}
              <Link to="/sustainability" className="font-semibold text-emerald-600 hover:text-emerald-500">
                sustainable practices
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
