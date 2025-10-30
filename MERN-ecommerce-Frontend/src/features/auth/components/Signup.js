import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { selectLoggedInUser, createUserAsync } from '../authSlice';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
  LockClosedIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

export default function Signup() {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength < 2) return { strength, text: 'Weak', color: 'text-red-500' };
    if (strength < 4) return { strength, text: 'Fair', color: 'text-yellow-500' };
    if (strength < 5) return { strength, text: 'Good', color: 'text-emerald-500' };
    return { strength, text: 'Strong', color: 'text-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(password);

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
              Join EcoMart
            </h2>
            <p className="mt-2 text-center text-sm text-emerald-700">
              Start your sustainable shopping journey today
            </p>
          </div>

          {/* Signup Form Card */}
          <div className="mt-8 bg-white/80 backdrop-blur-lg py-8 px-6 shadow-2xl rounded-2xl border border-emerald-200/30">
            <form
              noValidate
              className="space-y-6"
              onSubmit={handleSubmit((data) => {
                dispatch(
                  createUserAsync({
                    name: data.name?.trim(),
                    email: data.email,
                    password: data.password,
                    addresses: [],
                    role: 'user'
                  })
                );
                console.log(data);
              })}
            >
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold leading-6 text-emerald-800 mb-2"
                >
                  Your Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <UserIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <input
                    id="name"
                    {...register('name', {
                      required: 'Name is required',
                      validate: (v) => (v && v.trim().length >= 2) || 'Please enter your name',
                    })}
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="block w-full pl-10 pr-3 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {errors.name.message}
                  </p>
                )}
              </div>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold leading-6 text-emerald-800 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <EnvelopeIcon className="h-5 w-5 text-emerald-600" />
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
                    <XCircleIcon className="h-4 w-4 mr-1" />
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <LockClosedIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <input
                    id="password"
                    {...register('password', {
                      required: 'Password is required',
                      pattern: {
                        value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                        message: 'Password must meet the requirements below',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className="block w-full pl-10 pr-12 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-emerald-500 hover:text-emerald-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-emerald-500 hover:text-emerald-600" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-emerald-700">Password Strength:</span>
                      <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.strength < 2 ? 'bg-red-500' :
                          passwordStrength.strength < 4 ? 'bg-yellow-500' :
                            'bg-emerald-500'
                          }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-emerald-700 font-medium">Password must contain:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center ${password && password.length >= 8 ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {password && password.length >= 8 ?
                        <CheckCircleIcon className="h-3 w-3 mr-1" /> :
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      }
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${password && /[A-Z]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {password && /[A-Z]/.test(password) ?
                        <CheckCircleIcon className="h-3 w-3 mr-1" /> :
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      }
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${password && /[a-z]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {password && /[a-z]/.test(password) ?
                        <CheckCircleIcon className="h-3 w-3 mr-1" /> :
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      }
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${password && /\d/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {password && /\d/.test(password) ?
                        <CheckCircleIcon className="h-3 w-3 mr-1" /> :
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      }
                      One number
                    </div>
                  </div>
                </div>

                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold leading-6 text-emerald-800 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <LockClosedIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <input
                    id="confirmPassword"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value, formValues) =>
                        value === formValues.password || 'Passwords do not match',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="block w-full pl-10 pr-12 py-3 border border-emerald-200 rounded-xl text-gray-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-emerald-500 hover:text-emerald-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-emerald-500 hover:text-emerald-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms', { required: 'Please agree to the terms and privacy policy' })}
                  className="h-4 w-4 mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-emerald-700">
                  I agree to the{' '}
                  <Link to="/terms" className="font-semibold text-emerald-600 hover:text-emerald-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="font-semibold text-emerald-600 hover:text-emerald-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="-mt-2 mb-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {errors.terms.message}
                </p>
              )}

              {/* Signup Button */}
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <UserPlusIcon className="h-5 w-5 text-emerald-200 group-hover:text-emerald-100" />
                  </span>
                  Create Your Eco Account
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-emerald-600">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-emerald-300 rounded-xl text-sm font-semibold text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                >
                  Sign In to Your Account
                </Link>
              </div>
            </div>

            {/* Sustainability Message */}
            <div className="mt-6 text-center">
              <p className="text-xs text-emerald-600">
                🌱 Join our mission to make shopping more sustainable
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-emerald-700">
              By creating an account, you're helping us build a{' '}
              <span className="font-semibold text-emerald-600">greener future</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
