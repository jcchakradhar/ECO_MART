import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  ShoppingCartIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectItems } from '../cart/cartSlice';
import { selectLoggedInUser } from '../auth/authSlice';
import { selectUserInfo } from '../user/userSlice';

const navigation = [
  { name: 'Products', link: '/', user: true },
  { name: 'Products', link: '/admin', admin: true },
  { name: 'Orders', link: '/admin/orders', admin: true },
];

const userNavigation = [
  { name: 'My Profile', link: '/profile' },
  { name: 'My Orders', link: '/my-orders' },
  { name: 'Sign out', link: '/logout' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function NavBar({ children }) {
  const items = useSelector(selectItems);
  const userInfo = useSelector(selectUserInfo);

  return (
    <>
      {userInfo && (
        <div className="min-h-full">
          <Disclosure as="nav" className="bg-gradient-to-r from-emerald-800 via-teal-800 to-green-800 shadow-xl relative">
            {({ open }) => (
              <>
                {/* Subtle animated background */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-600 opacity-10 rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-600 opacity-10 rounded-full translate-x-12 translate-y-12 animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16 items-center justify-between">
                    {/* Logo and Navigation */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2">
                          <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">🌱</span>
                          </div>
                          <span className="text-xl font-bold bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                            EcoMart
                          </span>
                        </Link>
                      </div>
                      <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                          {navigation.map((item) =>
                            item[userInfo.role] ? (
                              <Link
                                key={item.name}
                                to={item.link}
                                className={classNames(
                                  item.current
                                    ? 'bg-emerald-700 text-white'
                                    : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white',
                                  'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 backdrop-blur-sm'
                                )}
                                aria-current={item.current ? 'page' : undefined}
                              >
                                {item.name}
                              </Link>
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                      <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-emerald-300" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-white/10 backdrop-blur-sm text-white placeholder-emerald-200 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 text-sm"
                          placeholder="Search eco-friendly products..."
                        />
                      </div>
                    </div>

                    {/* Right side items */}
                    <div className="hidden md:block">
                      <div className="ml-4 flex items-center md:ml-6 space-x-4">
                        {/* Cart */}
                        <Link to="/cart" className="relative">
                          <button
                            type="button"
                            className="relative rounded-full bg-white/10 backdrop-blur-sm p-2 text-emerald-200 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 transition-all duration-200"
                          >
                            <span className="sr-only">View cart</span>
                            <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                          {items.length > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                              {items.length}
                            </span>
                          )}
                        </Link>

                        {/* Profile dropdown */}
                        <Menu as="div" className="relative">
                          <div>
                            <Menu.Button className="flex max-w-xs items-center rounded-full bg-white/10 backdrop-blur-sm p-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 hover:bg-white/20 transition-all duration-200">
                              <span className="sr-only">Open user menu</span>
                              {userInfo.imageUrl ? (
                                <img
                                  className="h-8 w-8 rounded-full border-2 border-emerald-300"
                                  src={userInfo.imageUrl}
                                  alt=""
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-white" />
                                </div>
                              )}
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
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white/95 backdrop-blur-lg py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-emerald-200/30">
                              {userNavigation.map((item) => (
                                <Menu.Item key={item.name}>
                                  {({ active }) => (
                                    <Link
                                      to={item.link}
                                      className={classNames(
                                        active ? 'bg-emerald-50 text-emerald-900' : 'text-emerald-700',
                                        'block px-4 py-2 text-sm hover:bg-emerald-50 transition-colors duration-150'
                                      )}
                                    >
                                      {item.name}
                                    </Link>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm p-2 text-emerald-200 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 transition-all duration-200">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                {/* Mobile menu */}
                <Disclosure.Panel className="md:hidden">
                  <div className="bg-emerald-900/50 backdrop-blur-lg border-t border-emerald-700/50">
                    {/* Mobile Search */}
                    <div className="px-4 py-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-emerald-300" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-white/10 backdrop-blur-sm text-white placeholder-emerald-200 focus:outline-none focus:bg-white/20 text-sm"
                          placeholder="Search products..."
                        />
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="space-y-1 px-2 pb-3">
                      {navigation.map((item) =>
                        item[userInfo.role] ? (
                          <Link
                            key={item.name}
                            to={item.link}
                            className={classNames(
                              item.current
                                ? 'bg-emerald-700 text-white'
                                : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white',
                              'block rounded-xl px-3 py-2 text-base font-medium transition-all duration-200'
                            )}
                            aria-current={item.current ? 'page' : undefined}
                          >
                            {item.name}
                          </Link>
                        ) : null
                      )}
                    </div>

                    {/* Mobile User Info */}
                    <div className="border-t border-emerald-700/50 pb-3 pt-4">
                      <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                          {userInfo.imageUrl ? (
                            <img
                              className="h-10 w-10 rounded-full border-2 border-emerald-300"
                              src={userInfo.imageUrl}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-base font-medium leading-none text-white">
                            {userInfo.name}
                          </div>
                          <div className="text-sm font-medium leading-none text-emerald-200 mt-1">
                            {userInfo.email}
                          </div>
                        </div>
                        <Link to="/cart" className="relative">
                          <button
                            type="button"
                            className="ml-auto flex-shrink-0 rounded-full bg-white/10 backdrop-blur-sm p-2 text-emerald-200 hover:text-white hover:bg-white/20 transition-all duration-200"
                          >
                            <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                          {items.length > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
                              {items.length}
                            </span>
                          )}
                        </Link>
                      </div>
                      <div className="mt-3 space-y-1 px-2">
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.link}
                            className="block rounded-xl px-3 py-2 text-base font-medium text-emerald-100 hover:bg-emerald-700/50 hover:text-white transition-all duration-200"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          {/* Enhanced Header */}
          <header className="bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg border-b border-emerald-200/30">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
                Sustainable E-Commerce
              </h1>
              <p className="mt-1 text-sm text-emerald-700">
                🌱 Shop responsibly, live sustainably
              </p>
            </div>
          </header>

          <main className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 min-h-screen">
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default NavBar;
