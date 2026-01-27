/**
 * useTours Hook
 * Custom hook for fetching and managing tours
 */

import { useState, useEffect } from 'react';
import { toursAPI } from '../services/api';

export const useTours = (activeOnly = true) => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTours();
  }, [activeOnly]);

  const fetchTours = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await toursAPI.getAll(activeOnly);
      setTours(data.tours || []);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError(err.message || 'Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTours();
  };

  return {
    tours,
    loading,
    error,
    refetch,
  };
};

/**
 * useAvailableTours Hook
 * Fetch only available tours (active with tickets remaining)
 */
export const useAvailableTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableTours();
  }, []);

  const fetchAvailableTours = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await toursAPI.getAvailable();
      setTours(data || []);
    } catch (err) {
      console.error('Error fetching available tours:', err);
      setError(err.message || 'Failed to load available tours');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAvailableTours();
  };

  return {
    tours,
    loading,
    error,
    refetch,
  };
};

/**
 * useTour Hook
 * Fetch a single tour by ID
 */
export const useTour = (tourId) => {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tourId) {
      fetchTour();
    }
  }, [tourId]);

  const fetchTour = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await toursAPI.getById(tourId);
      setTour(data);
    } catch (err) {
      console.error('Error fetching tour:', err);
      setError(err.message || 'Failed to load tour');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTour();
  };

  return {
    tour,
    loading,
    error,
    refetch,
  };
};

export default useTours;