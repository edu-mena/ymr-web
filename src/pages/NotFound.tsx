import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Large 404 */}
        <div className="relative mb-8">
          <span className="text-9xl font-bold text-gray-100 select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-900">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400 mb-3">Popular pages</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/products" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
              Products
            </Link>
            <span className="text-gray-300">·</span>
            <Link to="/services" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
              Services
            </Link>
            <span className="text-gray-300">·</span>
            <Link to="/contact" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
              Contact
            </Link>
            <span className="text-gray-300">·</span>
            <Link to="/about" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
