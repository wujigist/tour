/**
 * TourList Component
 * Displays a grid of tour cards with selection management
 */

import React from 'react';
import TourCard from './TourCard';
import { SkeletonCard } from './common/Loading';

const TourList = ({
  tours = [],
  selectedTourIds = [],
  onSelect,
  onDeselect,
  loading = false,
  error = null,
  emptyMessage = 'No tours available',
  maxSelections = 5,
}) => {
  const canSelectMore = selectedTourIds.length < maxSelections;

  const handleSelect = (tour) => {
    if (canSelectMore) {
      onSelect?.(tour);
    }
  };

  const handleDeselect = (tour) => {
    onDeselect?.(tour);
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard count={6} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Tours</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (!tours || tours.length === 0) {
    return (
      <div className="text-center py-12">
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
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Tours Available</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Selection Counter */}
      {selectedTourIds.length > 0 && (
        <div className="mb-6 p-4 bg-primary-50 border-l-4 border-primary rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-gray-900">
                {selectedTourIds.length} of {maxSelections} tours selected
              </span>
            </div>
            
            {!canSelectMore && (
              <span className="text-sm text-gray-600">
                Maximum selections reached
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedTourIds.length / maxSelections) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tour Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <TourCard
            key={tour.id}
            tour={tour}
            isSelected={selectedTourIds.includes(tour.id)}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
            disabled={!canSelectMore && !selectedTourIds.includes(tour.id)}
          />
        ))}
      </div>

      {/* Warning when max reached */}
      {!canSelectMore && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold text-amber-900">Maximum Selections Reached</p>
              <p className="text-sm text-amber-800 mt-1">
                You've selected the maximum of {maxSelections} tours. Deselect a tour to choose a different one.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourList;