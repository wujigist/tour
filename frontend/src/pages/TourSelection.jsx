/**
 * Tour Selection Page
 * Browse and select up to 5 tours
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFan } from '../context/FanContext';
import { useAvailableTours } from '../hooks/useTours';
import TourList from '../components/TourList';
import Button from '../components/common/Button';
import { fansAPI } from '../services/api';
import { SuccessModal, ErrorModal } from '../components/common/Modal';

const TourSelection = () => {
  const navigate = useNavigate();
  const { fan, selections, setAllSelections, canSelectMore } = useFan();
  const { tours, loading, error, refetch } = useAvailableTours();
  
  const [selectedTourIds, setSelectedTourIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isLoadingSelections, setIsLoadingSelections] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterDate, setFilterDate] = useState('all'); // Filter state
  
  // Track if selections have been loaded to prevent duplicate calls
  const selectionsLoadedRef = useRef(false);

  // Load existing selections
  useEffect(() => {
    if (fan?.id && !selectionsLoadedRef.current) {
      loadSelections();
    }
  }, [fan?.id]);

  const loadSelections = async () => {
    if (isLoadingSelections) return;
    
    setIsLoadingSelections(true);
    try {
      const data = await fansAPI.getSelections(fan.id);
      setAllSelections(data);
      setSelectedTourIds(data.map((s) => s.tour_id));
      selectionsLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading selections:', error);
    } finally {
      setIsLoadingSelections(false);
    }
  };

  const handleSelectTour = (tour) => {
    if (selectedTourIds.length < 5 && !selectedTourIds.includes(tour.id)) {
      setSelectedTourIds((prev) => [...prev, tour.id]);
    }
  };

  const handleDeselectTour = (tour) => {
    setSelectedTourIds((prev) => prev.filter((id) => id !== tour.id));
  };

  const handleSubmit = async () => {
    if (selectedTourIds.length === 0) {
      setErrorMessage('Please select at least one tour');
      setShowError(true);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fansAPI.addBulkSelections(fan.id, selectedTourIds);
      setAllSelections(response);
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || 'Failed to save selections. Please try again.'
      );
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/preview');
  };

  const handleClearAll = () => {
    setSelectedTourIds([]);
  };

  // Filter tours by date
  const getFilteredTours = () => {
    if (!tours) return [];
    
    const now = new Date();
    const oneMonth = new Date();
    oneMonth.setMonth(oneMonth.getMonth() + 1);
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    return tours.filter((tour) => {
      const tourDate = new Date(tour.date);
      
      switch (filterDate) {
        case 'next-month':
          return tourDate >= now && tourDate <= oneMonth;
        case 'next-3-months':
          return tourDate >= now && tourDate <= threeMonths;
        case 'next-6-months':
          return tourDate >= now && tourDate <= sixMonths;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredTours = getFilteredTours();

  // Redirect if not logged in
  if (!fan) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Select Your <span className="text-gradient-gold">VIP</span> Tours
          </h1>
          <p className="text-gray-600 text-lg">
            Choose up to 5 tours you'd like to attend
          </p>
        </div>

        {/* Registration Code Display Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Your Registration Code</h3>
              <p className="text-primary-100 text-sm">Keep this safe - you'll need it to login</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3">
              <p className="text-3xl font-mono font-bold tracking-wider">
                {fan.registration_code}
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-primary-50 border-l-4 border-primary p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Welcome, {fan.name}!</h3>
              <p className="text-gray-700 text-sm">
                Browse the available tours below and select the ones you'd like to attend. 
                You can select up to 5 tours. Once you've made your selections, proceed to 
                the next step to complete your consent form and unlock your tickets.
              </p>
            </div>
          </div>
        </div>

        {/* Filter by Date */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <label className="font-semibold text-gray-700">Filter by Date:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterDate('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterDate === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All Tours
            </button>
            <button
              onClick={() => setFilterDate('next-month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterDate === 'next-month'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Next Month
            </button>
            <button
              onClick={() => setFilterDate('next-3-months')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterDate === 'next-3-months'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Next 3 Months
            </button>
            <button
              onClick={() => setFilterDate('next-6-months')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterDate === 'next-6-months'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Next 6 Months
            </button>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredTours.length} of {tours?.length || 0} tours
          </div>
        </div>

        {/* Tour List */}
        <TourList
          tours={filteredTours}
          selectedTourIds={selectedTourIds}
          onSelect={handleSelectTour}
          onDeselect={handleDeselectTour}
          loading={loading || isLoadingSelections}
          error={error}
          maxSelections={5}
        />

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help?{' '}
            <a href="/support" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>

      {/* STICKY BOTTOM BAR - Visible while scrolling */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Selection Count */}
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 rounded-full px-4 py-2">
                <span className="text-primary font-bold text-lg">
                  {selectedTourIds.length} / 5
                </span>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {selectedTourIds.length === 0 && 'No tours selected'}
                  {selectedTourIds.length === 1 && '1 tour selected'}
                  {selectedTourIds.length > 1 && `${selectedTourIds.length} tours selected`}
                </p>
                <p className="text-gray-600">
                  {selectedTourIds.length < 5
                    ? `You can select ${5 - selectedTourIds.length} more`
                    : 'Maximum reached'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={selectedTourIds.length === 0 || isLoadingSelections || submitting}
              >
                Clear All
              </Button>

              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting || selectedTourIds.length === 0 || isLoadingSelections}
                size="lg"
              >
                {submitting
                  ? 'Saving...'
                  : `Continue with ${selectedTourIds.length} ${
                      selectedTourIds.length === 1 ? 'Tour' : 'Tours'
                    }`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="Tours Selected!"
        message={`You've successfully selected ${selectedTourIds.length} tour${
          selectedTourIds.length === 1 ? '' : 's'
        }. Let's preview your tickets!`}
        buttonText="Preview Tickets"
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Selection Error"
        message={errorMessage}
      />
    </div>
  );
};

export default TourSelection;