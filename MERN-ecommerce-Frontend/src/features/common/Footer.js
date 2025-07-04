import { 
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

function Footer() {
  return (
    <>
      <footer className="bg-gradient-to-br from-emerald-800 via-teal-800 to-green-800 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-600 opacity-10 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-600 opacity-10 rounded-full translate-x-40 translate-y-40 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-xl">🌱</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                    EcoMart
                  </h3>
                </div>
                <p className="text-emerald-100 mb-6 max-w-md leading-relaxed">
                  Your trusted partner in sustainable shopping. We're committed to providing eco-friendly products 
                  that help you make a positive impact on our planet.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-200 mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/about" className="text-emerald-100 hover:text-white transition-colors duration-200">About Us</a></li>
                <li><a href="/sustainability" className="text-emerald-100 hover:text-white transition-colors duration-200">Our Mission</a></li>
                <li><a href="/products" className="text-emerald-100 hover:text-white transition-colors duration-200">Eco Products</a></li>
                <li><a href="/carbon-ratings" className="text-emerald-100 hover:text-white transition-colors duration-200">Carbon Ratings</a></li>
                <li><a href="/blog" className="text-emerald-100 hover:text-white transition-colors duration-200">Green Living Blog</a></li>
                <li><a href="/contact" className="text-emerald-100 hover:text-white transition-colors duration-200">Contact Us</a></li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-200 mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="/help" className="text-emerald-100 hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="/shipping" className="text-emerald-100 hover:text-white transition-colors duration-200">Eco Shipping</a></li>
                <li><a href="/returns" className="text-emerald-100 hover:text-white transition-colors duration-200">Returns Policy</a></li>
                <li><a href="/faq" className="text-emerald-100 hover:text-white transition-colors duration-200">FAQ</a></li>
                <li><a href="/track" className="text-emerald-100 hover:text-white transition-colors duration-200">Track Order</a></li>
                <li><a href="/account" className="text-emerald-100 hover:text-white transition-colors duration-200">My Account</a></li>
              </ul>
            </div>
          </div>

          {/* App Download Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
            <div className="text-center">
              <DevicePhoneMobileIcon className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-200 mb-3">
                Download Our Sustainable Shopping App
              </h3>
              <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
                Shop eco-friendly products on the go. Track your carbon footprint and make sustainable choices easier.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                {/* Google Play Store */}
                <a href="#" className="flex items-center bg-black/20 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 hover:bg-black/30 transition-all duration-200 transform hover:-translate-y-1 w-full sm:w-auto">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/888/888857.png"
                    className="w-8 h-8 mr-3"
                    alt="Google Play"
                  />
                  <div className="text-left">
                    <p className="text-xs text-emerald-200">Get it on</p>
                    <p className="text-base font-semibold text-white">Google Play</p>
                  </div>
                </a>

                {/* Apple App Store */}
                <a href="#" className="flex items-center bg-black/20 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 hover:bg-black/30 transition-all duration-200 transform hover:-translate-y-1 w-full sm:w-auto">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/888/888841.png"
                    className="w-8 h-8 mr-3"
                    alt="App Store"
                  />
                  <div className="text-left">
                    <p className="text-xs text-emerald-200">Download on the</p>
                    <p className="text-base font-semibold text-white">App Store</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center mb-8">
            <h4 className="text-lg font-semibold text-emerald-200 mb-4">Follow Our Green Journey</h4>
            <div className="flex justify-center space-x-4">
              <a href="#" className="bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all duration-200 transform hover:-translate-y-1">
                <span className="text-emerald-200 text-xl">📘</span>
              </a>
              <a href="#" className="bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all duration-200 transform hover:-translate-y-1">
                <span className="text-emerald-200 text-xl">📷</span>
              </a>
              <a href="#" className="bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all duration-200 transform hover:-translate-y-1">
                <span className="text-emerald-200 text-xl">🐦</span>
              </a>
              <a href="#" className="bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all duration-200 transform hover:-translate-y-1">
                <span className="text-emerald-200 text-xl">💼</span>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <div className="text-emerald-100 mb-4 md:mb-0">
                <p>© 2025 EcoMart. All rights reserved. 🌱 Making shopping sustainable.</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end space-x-6">
                <a href="/privacy" className="text-emerald-100 hover:text-white transition-colors duration-200">Privacy Policy</a>
                <a href="/terms" className="text-emerald-100 hover:text-white transition-colors duration-200">Terms of Service</a>
                <a href="/cookies" className="text-emerald-100 hover:text-white transition-colors duration-200">Cookie Policy</a>
                <a href="/accessibility" className="text-emerald-100 hover:text-white transition-colors duration-200">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
