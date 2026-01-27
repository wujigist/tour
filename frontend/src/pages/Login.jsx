/**
 * Login Page
 * Login with registration code for returning users
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFan } from '../context/FanContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

const Login = () => {
  const navigate = useNavigate();
  const { loginFan, isLoggedIn } = useFan();
  
  const [registrationCode, setRegistrationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!registrationCode.trim()) {
      setError('Please enter your registration code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginFan(registrationCode.trim());
      navigate('/tours');
    } catch (err) {
      setError(err.message || 'Invalid registration code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate('/tours');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <div className="mb-8 text-center">
          <Link to="/" className="text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="vip-card">
          <div className="vip-card-header">
            <h2 className="text-3xl font-bold text-center">
              Welcome Back
            </h2>
            <p className="text-center text-sm opacity-90 mt-2">
              Enter your registration code to continue
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Registration Code"
                name="registrationCode"
                value={registrationCode}
                onChange={(e) => {
                  setRegistrationCode(e.target.value);
                  setError('');
                }}
                error={error}
                placeholder="VIP-XXXXXXXXX"
                required
                autoFocus
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Where to find your code?</p>
                    <p>Check your email or the registration confirmation you received when you first signed up.</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/" className="text-primary hover:underline font-semibold">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Lost your registration code?{' '}
            <a href="/support" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;