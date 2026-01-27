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
  
  // Track if selections have been loaded to prevent duplicate calls
  const selectionsLoadedRef = useRef(false);

  // Load existing selections - FIXED: Only depends on fan.id
  useEffect(() => {
    if (fan?.id && !selectionsLoadedRef.current) {
      loadSelections();
    }
  }, [fan?.id]); // Changed from [fan] to [fan?.id]

  const loadSelections = async () => {
    // Prevent concurrent calls
    if (isLoadingSelections) return;
    
    setIsLoadingSelections(true);
    try {
      const data = await fansAPI.getSelections(fan.id);
      setAllSelections(data);
      setSelectedTourIds(data.map((s) => s.tour_id));
      selectionsLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading selections:', error);
      // Don't show error modal for initial load, just log it
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
      // Submit all selections
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

  // Redirect if not logged in
  if (!fan) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Select Your <span className="text-gradient-gold">VIP</span> Tours
          </h1>
          <p className="text-gray-600 text-lg">
            Choose up to 5 tours you'd like to attend
          </p>
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

        {/* Tour List */}
        <TourList
          tours={tours}
          selectedTourIds={selectedTourIds}
          onSelect={handleSelectTour}
          onDeselect={handleDeselectTour}
          loading={loading || isLoadingSelections}
          error={error}
          maxSelections={5}
        />

        {/* Action Buttons */}
        {tours.length > 0 && (
          <div className="mt-8 flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setSelectedTourIds([])}
              disabled={selectedTourIds.length === 0 || isLoadingSelections}
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
        )}

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