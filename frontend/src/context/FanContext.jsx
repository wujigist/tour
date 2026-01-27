/**
 * Fan Context
 * Global state management for fan data and tour selections
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { fansAPI } from '../services/api';

const FanContext = createContext(null);

export const useFan = () => {
  const context = useContext(FanContext);
  if (!context) {
    throw new Error('useFan must be used within a FanProvider');
  }
  return context;
};

export const FanProvider = ({ children }) => {
  const [fan, setFan] = useState(null);
  const [selections, setSelections] = useState([]);
  const [consent, setConsent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load fan data from localStorage on mount
  useEffect(() => {
    const storedFanId = localStorage.getItem('fanId');
    const storedFan = localStorage.getItem('fanData');
    
    if (storedFanId && storedFan) {
      try {
        setFan(JSON.parse(storedFan));
      } catch (err) {
        console.error('Error parsing stored fan data:', err);
        localStorage.removeItem('fanData');
        localStorage.removeItem('fanId');
      }
    }
  }, []);

  // Save fan data to localStorage whenever it changes
  useEffect(() => {
    if (fan) {
      localStorage.setItem('fanId', fan.id.toString());
      localStorage.setItem('fanData', JSON.stringify(fan));
    }
  }, [fan]);

  /**
   * Register a new fan - just stores the fan data (no API call)
   * @param {object} fanData - Fan data from API response
   */
  const registerFan = (fanData) => {
    setFan(fanData);
  };

  /**
   * Login existing fan by registration code
   * @param {string} code - Registration code
   */
  const loginFan = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fansAPI.getByCode(code);
      setFan(response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid registration code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update fan data
   */
  const updateFan = (newFanData) => {
    setFan((prev) => ({ ...prev, ...newFanData }));
  };

  /**
   * Add tour selection
   */
  const addSelection = (selection) => {
    setSelections((prev) => [...prev, selection]);
    
    // Update fan's selections_count
    if (fan) {
      setFan((prev) => ({
        ...prev,
        selections_count: (prev.selections_count || 0) + 1,
        can_select_more_tours: (prev.selections_count || 0) + 1 < 5,
      }));
    }
  };

  /**
   * Remove tour selection
   */
  const removeSelection = (selectionId) => {
    setSelections((prev) => prev.filter((s) => s.id !== selectionId));
    
    // Update fan's selections_count
    if (fan) {
      setFan((prev) => ({
        ...prev,
        selections_count: Math.max(0, (prev.selections_count || 0) - 1),
        can_select_more_tours: true,
      }));
    }
  };

  /**
   * Set all selections at once
   */
  const setAllSelections = (newSelections) => {
    setSelections(newSelections);
    
    // Update fan's selections_count
    if (fan) {
      setFan((prev) => ({
        ...prev,
        selections_count: newSelections.length,
        can_select_more_tours: newSelections.length < 5,
      }));
    }
  };

  /**
   * Update consent data
   */
  const updateConsent = (consentData) => {
    setConsent(consentData);
    
    // Update fan's consent status
    if (fan) {
      setFan((prev) => ({
        ...prev,
        has_completed_consent: consentData.is_complete || false,
      }));
    }
  };

  /**
   * Clear all fan data (logout)
   */
  const clearFan = () => {
    setFan(null);
    setSelections([]);
    setConsent(null);
    localStorage.removeItem('fanId');
    localStorage.removeItem('fanData');
  };

  /**
   * Check if max selections reached
   */
  const canSelectMore = () => {
    return selections.length < 5;
  };

  /**
   * Get selected tour IDs
   */
  const getSelectedTourIds = () => {
    return selections.map((s) => s.tour_id);
  };

  /**
   * Check if tour is selected
   */
  const isTourSelected = (tourId) => {
    return selections.some((s) => s.tour_id === tourId);
  };

  const value = {
    // State
    fan,
    selections,
    consent,
    loading,
    error,
    
    // Actions
    registerFan,
    loginFan,
    updateFan,
    addSelection,
    removeSelection,
    setAllSelections,
    updateConsent,
    clearFan,
    
    // Helpers
    canSelectMore,
    getSelectedTourIds,
    isTourSelected,
    
    // Computed values
    isLoggedIn: !!fan,
    hasConsent: !!consent && consent.is_complete,
    selectionsCount: selections.length,
    canUnlockTickets: !!fan && fan.has_completed_consent,
  };

  return <FanContext.Provider value={value}>{children}</FanContext.Provider>;
};

export default FanContext;