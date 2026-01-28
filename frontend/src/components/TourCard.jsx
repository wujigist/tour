/**
 * TourCard Component
 * Displays individual tour information with selection capability
 */

import React from 'react';
import { formatDateTime } from '../utils/validators';
import Button from './common/Button';

const TourCard = ({
  tour,
  isSelected = false,
  onSelect,
  onDeselect,
  disabled = false,
  showActions = true,
}) => {
  const handleToggleSelect = () => {
    if (isSelected) {
      onDeselect?.(tour);
    } else {
      onSelect?.(tour);
    }
  };

  return (
    <div className={`vip-card ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {/* Image/Header */}
      {tour.image_url ? (
        <div className="h-48 overflow-hidden">
          <img
            src={tour.image_url}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="vip-card-header">
          <h3 className="text-xl font-bold">{tour.title}</h3>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {tour.image_url && (
          <h3 className="text-xl font-bold text-gray-900 mb-3">{tour.title}</h3>
        )}

        {/* Artists */}
        <div className="flex items-start gap-2 mb-3">
          <svg
            className="w-5 h-5 text-primary mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Artists</p>
            <p className="text-gray-900">{tour.artists}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-start gap-2 mb-3">
          <svg
            className="w-5 h-5 text-primary mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Date & Time</p>
            <p className="text-gray-900">{formatDateTime(tour.date)}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-4">
          <svg
            className="w-5 h-5 text-primary mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">Venue</p>
            <p className="text-gray-900">{tour.venue}</p>
            <p className="text-gray-600 text-sm">{tour.city}</p>
          </div>
        </div>

        {/* Description */}
        {tour.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {tour.description}
          </p>
        )}

        {/* Availability */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Tickets Available</p>
            <p className="text-lg font-bold text-primary">
              {tour.tickets_remaining} / 100
            </p>
          </div>
          
          {tour.is_available ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              Available
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              Sold Out
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {isSelected ? (
              <Button
                variant="outline"
                fullWidth
                onClick={handleToggleSelect}
                disabled={disabled}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Selected
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={handleToggleSelect}
                disabled={disabled || !tour.is_available}
              >
                {tour.is_available ? 'Select Tour' : 'Sold Out'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Selected Badge Overlay */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="bg-primary text-white rounded-full p-2 shadow-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourCard;