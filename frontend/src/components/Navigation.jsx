/**
 * Navigation Component
 * Main navigation bar with VIP branding
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFan } from '../context/FanContext';

const Navigation = () => {
  const { fan, isLoggedIn, selectionsCount, clearFan } = useFan();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      clearFan();
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gradient-gold">VIP</div>
            <span className="text-xl font-semibold text-secondary-800">
              Tickets
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                <Link
                  to="/tours"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  Tours
                </Link>
                
                <Link
                  to="/selections"
                  className="text-gray-700 hover:text-primary font-medium transition-colors flex items-center gap-2"
                >
                  My Selections
                  {selectionsCount > 0 && (
                    <span className="vip-badge">{selectionsCount}</span>
                  )}
                </Link>

                <Link
                  to="/consent"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  Consent
                </Link>

                <Link
                  to="/tickets"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  My Tickets
                </Link>

                {/* User Menu */}
                <div className="flex items-center gap-4 pl-4 border-l border-gray-300">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{fan.name}</p>
                    <p className="text-gray-500 text-xs">{fan.email}</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <Link to="/" className="btn-primary">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{fan.name}</p>
                  <p className="text-gray-500 text-sm">{fan.email}</p>
                </div>

                <Link
                  to="/tours"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tours
                </Link>

                <Link
                  to="/selections"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>My Selections</span>
                  {selectionsCount > 0 && (
                    <span className="vip-badge">{selectionsCount}</span>
                  )}
                </Link>

                <Link
                  to="/consent"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Consent
                </Link>

                <Link
                  to="/tickets"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Tickets
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/"
                className="block btn-primary text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;