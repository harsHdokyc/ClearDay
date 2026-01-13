import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                ClearDay
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Dashboard
              </Link>
              
              <Link
                to="/history"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/history')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                History
              </Link>
              
              <Link
                to="/product-evaluation"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/product-evaluation')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Product Evaluation
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Dashboard
            </Link>
            
            <Link
              to="/history"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/history')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              History
            </Link>
            
            <Link
              to="/product-evaluation"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/product-evaluation')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Product Evaluation
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
