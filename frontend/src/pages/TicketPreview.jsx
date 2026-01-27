/**
 * Ticket Preview Page
 * Shows blurred ticket previews before consent
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFan } from '../context/FanContext';
import { TicketPreviewList } from '../components/TicketPreview';
import Button from '../components/common/Button';
import { SectionLoader } from '../components/common/Loading';
import { fansAPI } from '../services/api';

const TicketPreviewPage = () => {
  const navigate = useNavigate();
  const { fan, selections, setAllSelections, hasConsent } = useFan();
  
  const [loading, setLoading] = useState(true);
  const selectionsLoadedRef = useRef(false);

  useEffect(() => {
    if (!fan) {
      navigate('/');
      return;
    }

    // Only load selections once
    if (!selectionsLoadedRef.current) {
      loadSelections();
    }
  }, [fan?.id]); // Changed from [fan] to [fan?.id]

  // Separate effect for consent redirect
  useEffect(() => {
    if (hasConsent) {
      navigate('/tickets');
    }
  }, [hasConsent, navigate]);

  const loadSelections = async () => {
    try {
      const data = await fansAPI.getSelections(fan.id);
      setAllSelections(data);
      selectionsLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading selections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    navigate('/consent');
  };

  const handleBackToTours = () => {
    navigate('/tours');
  };

  // Don't render anything if redirecting
  if (!fan || hasConsent) {
    return null;
  }

  if (loading) {
    return <SectionLoader message="Loading your tickets..." height="60vh" />;
  }

  if (!selections || selections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container-custom max-w-2xl text-center">
          <div className="vip-card p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">No Tours Selected</h2>
            <p className="text-gray-600 mb-6">
              You haven't selected any tours yet. Please select at least one tour to continue.
            </p>
            <Button variant="primary" onClick={handleBackToTours}>
              Select Tours
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Your <span className="text-gradient-gold">VIP</span> Tickets
          </h1>
          <p className="text-gray-600 text-lg">
            Preview of your {selections.length} ticket{selections.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Tickets Locked</h3>
              <p className="text-amber-800 text-sm">
                Your tickets are currently locked. Complete the consent form below to unlock 
                and download your VIP tickets. This is a one-time requirement.
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Previews (Blurred) */}
        <div className="mb-8">
          <TicketPreviewList
            selections={selections}
            fanName={fan.name}
            isBlurred={true}
            onUnlockClick={handleUnlockClick}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button variant="outline" onClick={handleBackToTours}>
            Modify Selections
          </Button>

          <Button variant="primary" onClick={handleUnlockClick} size="lg">
            Complete Consent Form
          </Button>
        </div>

        {/* What's Next */}
        <div className="vip-card p-6">
          <h3 className="text-xl font-bold mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Complete Consent Form</p>
                <p className="text-sm text-gray-600">
                  Fill out the required consent form with your information
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">Unlock Your Tickets</p>
                <p className="text-sm text-gray-600">
                  Your tickets will be automatically unlocked after consent
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">Download & Enjoy</p>
                <p className="text-sm text-gray-600">
                  Download your VIP tickets and get ready for the shows!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewPage;