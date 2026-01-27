/**
 * Ticket Download Page
 * View and download unlocked VIP tickets
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFan } from '../context/FanContext';
import Button from '../components/common/Button';
import { GoldShimmerLoader, SectionLoader } from '../components/common/Loading';
import { SuccessModal, ErrorModal } from '../components/common/Modal';
import { ticketsAPI, fansAPI } from '../services/api';
import { formatDateTime } from '../utils/validators';

const TicketDownload = () => {
  const navigate = useNavigate();
  const { fan, selections, setAllSelections, hasConsent } = useFan();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!fan) {
      navigate('/');
      return;
    }

    if (!hasConsent) {
      navigate('/consent');
      return;
    }

    loadTickets();
  }, [fan, hasConsent]);

  const loadTickets = async () => {
    try {
      // Load selections with ticket info
      const selectionsData = await fansAPI.getSelections(fan.id);
      setAllSelections(selectionsData);
      
      // Check if tickets need to be generated
      const needsGeneration = selectionsData.some((s) => !s.has_ticket);
      
      if (needsGeneration) {
        await generateTickets();
      } else {
        // Load ticket download info
        const ticketData = await ticketsAPI.getDownloads(fan.id);
        setTickets(ticketData.tickets || []);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setErrorMessage('Failed to load tickets. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const generateTickets = async () => {
    setGenerating(true);
    
    try {
      const response = await ticketsAPI.generateForFan(fan.id);
      
      // Reload tickets
      const ticketData = await ticketsAPI.getDownloads(fan.id);
      setTickets(ticketData.tickets || []);
      
      setShowSuccess(true);
    } catch (error) {
      console.error('Error generating tickets:', error);
      setErrorMessage(
        error.response?.data?.detail || 'Failed to generate tickets. Please try again.'
      );
      setShowError(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (ticketId) => {
    const downloadUrl = ticketsAPI.download(ticketId);
    window.open(downloadUrl, '_blank');
  };

  const handleDownloadAll = () => {
    tickets.forEach((ticket) => {
      setTimeout(() => {
        handleDownload(ticket.ticket_id);
      }, 500);
    });
  };

  if (!fan || !hasConsent) {
    return null;
  }

  if (loading) {
    return <SectionLoader message="Loading your tickets..." height="60vh" />;
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <GoldShimmerLoader text="Generating your VIP tickets..." />
      </div>
    );
  }

  if (tickets.length === 0) {
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
            <h2 className="text-2xl font-bold mb-4">No Tickets Available</h2>
            <p className="text-gray-600 mb-6">
              It looks like you don't have any tickets yet. Please select some tours first.
            </p>
            <Button variant="primary" onClick={() => navigate('/tours')}>
              Select Tours
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Your <span className="text-gradient-gold">VIP</span> Tickets
          </h1>
          <p className="text-gray-600 text-lg">
            {tickets.length} ticket{tickets.length === 1 ? '' : 's'} ready to download
          </p>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-8 animate-unlock">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-bold text-green-900 mb-2">Tickets Unlocked!</h3>
              <p className="text-green-800 text-sm">
                Your VIP tickets are ready! Download them below and present them at the venue entrance.
              </p>
            </div>
          </div>
        </div>

        {/* Download All Button */}
        {tickets.length > 1 && (
          <div className="mb-6 flex justify-end">
            <Button variant="primary" onClick={handleDownloadAll}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download All Tickets
            </Button>
          </div>
        )}

        {/* Tickets Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {tickets.map((ticket) => (
            <div key={ticket.ticket_id} className="vip-card">
              <div className="vip-card-header">
                <h3 className="text-lg font-bold">{ticket.tour_title}</h3>
              </div>

              <div className="p-6">
                {/* Ticket Info */}
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">DATE & TIME</p>
                    <p className="text-gray-900">{formatDateTime(ticket.tour_date)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-semibold">LOCATION</p>
                    <p className="text-gray-900">{ticket.tour_city}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-semibold">TICKET ID</p>
                    <p className="text-sm font-mono text-gray-900">{ticket.ticket_id}</p>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleDownload(ticket.ticket_id)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download Ticket
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Important Information */}
        <div className="vip-card p-6">
          <h3 className="text-xl font-bold mb-4">Important Information</h3>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>
                <strong>Present Your Ticket:</strong> Show this ticket at the venue entrance for scanning.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>
                <strong>Arrive Early:</strong> VIP guests are encouraged to arrive 30 minutes before the event start time.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>
                <strong>Save Your Tickets:</strong> Keep digital or printed copies of your tickets for easy access.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>
                <strong>Questions?</strong> Contact support if you have any issues with your tickets.
              </p>
            </div>
          </div>
        </div>

        {/* Enjoy Message */}
        <div className="text-center mt-8 p-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
          <h2 className="text-3xl font-bold mb-4">
            Enjoy Your <span className="text-gradient-gold">VIP</span> Experience!
          </h2>
          <p className="text-lg text-gray-700">
            We hope you have an amazing time at the shows! 🎉
          </p>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Tickets Generated!"
        message="Your VIP tickets have been generated successfully and are ready to download."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMessage}
      />
    </div>
  );
};

export default TicketDownload;