/**
 * TicketPreview Component
 * Displays blurred ticket preview before consent completion
 */

import React from 'react';
import Button from './common/Button';
import { formatDateTime } from '../utils/validators';

const TicketPreview = ({
  tour,
  fanName = 'Your Name',
  isBlurred = true,
  ticketId = 'TKT-XXXXXXXXXX',
  onUnlockClick,
}) => {
  return (
    <div className="relative">
      {/* Ticket Container */}
      <div
        className={`vip-card overflow-hidden ${
          isBlurred ? 'blur-content' : 'animate-unlock'
        }`}
      >
        {/* Ticket Header */}
        <div className="vip-card-header text-center py-8">
          <h1 className="text-4xl font-bold mb-2">VIP TICKET</h1>
          <p className="text-sm opacity-90">Exclusive Access Pass</p>
        </div>

        {/* Ticket Body */}
        <div className="p-8">
          {/* Ticket ID */}
          <div className="text-center mb-6 pb-6 border-b-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-500 mb-1">TICKET ID</p>
            <p className="text-lg font-mono font-bold text-gray-900">{ticketId}</p>
          </div>

          {/* Fan Name */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 font-semibold mb-1">GUEST NAME</p>
            <p className="text-xl font-bold text-gray-900">{fanName}</p>
          </div>

          {/* Tour Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-primary mb-4">TOUR DETAILS</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-semibold">EVENT</p>
                <p className="text-lg font-bold text-gray-900">{tour?.title || 'Tour Title'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold">ARTISTS</p>
                <p className="text-gray-900">{tour?.artists || 'Artist Names'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold">DATE & TIME</p>
                <p className="text-gray-900">
                  {tour?.date ? formatDateTime(tour.date) : 'Date & Time'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold">VENUE</p>
                <p className="text-gray-900">{tour?.venue || 'Venue Name'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold">LOCATION</p>
                <p className="text-gray-900">{tour?.city || 'City'}</p>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500">Scan for Verification</p>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600">
              This is your official VIP access pass.
            </p>
            <p className="text-xs text-gray-600">
              Please present this ticket at the venue.
            </p>
          </div>
        </div>
      </div>

      {/* Unlock Overlay */}
      {isBlurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
          <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ticket Locked
            </h3>
            <p className="text-gray-600 mb-6">
              Complete the consent form to unlock and download your VIP tickets.
            </p>

            <Button variant="primary" fullWidth onClick={onUnlockClick}>
              Complete Consent Form
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Multiple Ticket Previews
 */
export const TicketPreviewList = ({
  selections = [],
  fanName,
  isBlurred = true,
  onUnlockClick,
}) => {
  if (selections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No tour selections yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selections.map((selection, index) => (
        <TicketPreview
          key={selection.id || index}
          tour={selection.tour}
          fanName={fanName}
          isBlurred={isBlurred}
          ticketId={selection.ticket_id}
          onUnlockClick={onUnlockClick}
        />
      ))}
    </div>
  );
};

export default TicketPreview;