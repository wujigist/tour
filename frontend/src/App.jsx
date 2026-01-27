/**
 * App Component
 * Main application with routing and layout
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FanProvider } from './context/FanContext';
import Navigation from './components/Navigation';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import TourSelection from './pages/TourSelection';
import TicketPreviewPage from './pages/TicketPreview';
import ConsentPage from './pages/ConsentPage';
import TicketDownload from './pages/TicketDownload';
import Admin from './pages/Admin';

// Protected Route Component
const ProtectedRoute = ({ children, requiresAuth = true, requiresConsent = false }) => {
  const fan = JSON.parse(localStorage.getItem('fanData') || 'null');
  const hasConsent = fan?.has_completed_consent || false;

  if (requiresAuth && !fan) {
    return <Navigate to="/login" replace />;
  }

  if (requiresConsent && !hasConsent) {
    return <Navigate to="/consent" replace />;
  }

  return children;
};

function App() {
  return (
    <FanProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Route */}
              <Route path="/janjan/001/admin" element={<Admin />} />

              {/* Protected Routes */}
              <Route
                path="/tours"
                element={
                  <ProtectedRoute>
                    <TourSelection />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/selections"
                element={
                  <ProtectedRoute>
                    <TourSelection />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/preview"
                element={
                  <ProtectedRoute>
                    <TicketPreviewPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/consent"
                element={
                  <ProtectedRoute>
                    <ConsentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tickets"
                element={
                  <ProtectedRoute requiresConsent>
                    <TicketDownload />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="container-custom py-8">
              <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600">
                {/* Brand */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="text-2xl font-bold text-gradient-gold">VIP</div>
                    <span className="text-xl font-semibold text-secondary-800">
                      Tickets
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Your exclusive access to VIP concert experiences.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/" className="hover:text-primary transition-colors">
                        Home
                      </a>
                    </li>
                    <li>
                      <a href="/tours" className="hover:text-primary transition-colors">
                        Browse Tours
                      </a>
                    </li>
                    <li>
                      <a href="/support" className="hover:text-primary transition-colors">
                        Support
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/terms" className="hover:text-primary transition-colors">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a href="/privacy" className="hover:text-primary transition-colors">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="/contact" className="hover:text-primary transition-colors">
                        Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
                <p>&copy; {new Date().getFullYear()} VIP Tickets. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </FanProvider>
  );
}

export default App;