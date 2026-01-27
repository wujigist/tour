/**
 * Landing Page
 * Welcome page with fan registration
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFan } from '../context/FanContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { SuccessModal } from '../components/common/Modal';
import { fansAPI } from '../services/api';
import { validateEmail, validatePhone, validateFullName } from '../utils/validators';

const Landing = () => {
  const navigate = useNavigate();
  const { registerFan, isLoggedIn } = useFan();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (!validateFullName(formData.name)) {
      newErrors.name = 'Please enter your full name (first and last name)';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fansAPI.register(formData);
      setRegistrationCode(response.registration_code);
      
      // Pass the fan object from the response, not the form data
      registerFan(response.fan);
      
      // IMPORTANT: Show modal IMMEDIATELY after registration
      setShowSuccess(true);
    } catch (error) {
      setErrors({
        submit: error.response?.data?.detail || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Navigate to tours page AFTER user closes the modal
    navigate('/tours');
  };

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate('/tours');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="container-custom py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div>
              <div className="inline-block mb-4">
                <span className="vip-badge text-lg px-6 py-2">
                  🎫 Exclusive Access
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Your <span className="text-gradient-gold gold-shine">VIP</span> Experience Awaits
              </h1>
              
              <p className="text-xl text-gray-700 mb-8">
                Congratulations! You've been selected for exclusive VIP access to upcoming tours. 
                Select up to 5 shows and receive your personalized VIP tickets.
              </p>

              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                {[
                  'Select up to 5 exclusive tour dates',
                  'VIP tickets with priority access',
                  'Personalized digital tickets',
                  'Easy digital download',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-primary">5</div>
                  <div className="text-sm text-gray-600">Max Tours</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-primary">VIP</div>
                  <div className="text-sm text-gray-600">Access Level</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-primary">Free</div>
                  <div className="text-sm text-gray-600">No Cost</div>
                </div>
              </div>
            </div>

            {/* Right Column - Registration Form */}
            <div className="vip-card">
              <div className="vip-card-header">
                <h2 className="text-2xl font-bold text-center">
                  Get Started
                </h2>
                <p className="text-center text-sm opacity-90 mt-1">
                  Register to claim your VIP tickets
                </p>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="John Doe"
                    required
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="john@example.com"
                    required
                  />

                  <Input
                    label="Phone Number (Optional)"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="(123) 456-7890"
                  />

                  {errors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register Now'}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already registered?{' '}
                      <Link to="/login" className="text-primary hover:underline font-semibold">
                        Login here
                      </Link>
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 text-center">
                    By registering, you agree to our{' '}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Register',
                description: 'Sign up with your information',
                icon: '📝',
              },
              {
                step: '2',
                title: 'Select Tours',
                description: 'Choose up to 5 shows',
                icon: '🎤',
              },
              {
                step: '3',
                title: 'Complete Consent',
                description: 'Fill out the consent form',
                icon: '✍️',
              },
              {
                step: '4',
                title: 'Get Tickets',
                description: 'Download your VIP tickets',
                icon: '🎫',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-primary mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Modal - DISPLAYS IMMEDIATELY AFTER REGISTRATION */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="🎉 Registration Successful!"
        message={
          <div className="text-center">
            <p className="mb-6 text-lg">Welcome to VIP Tickets!</p>
            
            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary mb-6">
              <p className="text-sm text-gray-700 mb-3 font-semibold">Your Registration Code:</p>
              <p className="text-3xl font-mono font-bold text-primary mb-3 tracking-wider">
                {registrationCode}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <span>Save this code - you'll need it to login later</span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 font-medium mb-2">📧 Check Your Email</p>
              <p className="text-xs text-blue-700">
                We've sent your registration code to <strong>{formData.email}</strong>
              </p>
            </div>

            <p className="text-sm text-gray-600">
              Click below to start selecting your VIP tours!
            </p>
          </div>
        }
        buttonText="Select Tours →"
      />
    </div>
  );
};

export default Landing;