/**
 * Admin Page
 * Tour management interface for administrators
 */

import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import Input, { Textarea } from '../components/common/Input';
import { SuccessModal, ErrorModal } from '../components/common/Modal';
import { SectionLoader } from '../components/common/Loading';
import axios from 'axios';

const ADMIN_KEY = 'admin-secret-key-change-in-production'; // Should be in env

const Admin = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingTour, setEditingTour] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    city: '',
    venue: '',
    artists: '',
    ticket_limit: 100,
    description: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/janjan/001/admin/tours`,
        { params: { admin_key: ADMIN_KEY } }
      );
      setTours(response.data);
    } catch (error) {
      console.error('Error loading tours:', error);
      setErrorMessage('Failed to load tours');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        ticket_limit: parseInt(formData.ticket_limit),
        date: new Date(formData.date).toISOString(),
      };

      if (editingTour) {
        // Update existing tour
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/janjan/001/admin/tours/${editingTour.id}`,
          payload,
          { params: { admin_key: ADMIN_KEY } }
        );
      } else {
        // Create new tour
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/janjan/001/admin/tours`,
          payload,
          { params: { admin_key: ADMIN_KEY } }
        );
      }

      setShowSuccess(true);
      resetForm();
      loadTours();
    } catch (error) {
      console.error('Error saving tour:', error);
      setErrorMessage(
        error.response?.data?.detail || 'Failed to save tour'
      );
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title,
      date: new Date(tour.date).toISOString().slice(0, 16),
      city: tour.city,
      venue: tour.venue,
      artists: tour.artists,
      ticket_limit: tour.ticket_limit,
      description: tour.description || '',
      image_url: tour.image_url || '',
      is_active: tour.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (tourId) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/janjan/001/admin/tours/${tourId}`,
        { params: { admin_key: ADMIN_KEY } }
      );
      setShowSuccess(true);
      loadTours();
    } catch (error) {
      console.error('Error deleting tour:', error);
      setErrorMessage('Failed to delete tour');
      setShowError(true);
    }
  };

  const resetForm = () => {
    setEditingTour(null);
    setFormData({
      title: '',
      date: '',
      city: '',
      venue: '',
      artists: '',
      ticket_limit: 100,
      description: '',
      image_url: '',
      is_active: true,
    });
  };

  if (loading) {
    return <SectionLoader message="Loading admin panel..." height="60vh" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient-gold">Admin</span> Panel
          </h1>
          <p className="text-gray-600 text-lg">Manage tours and view statistics</p>
        </div>

        {/* Create/Edit Tour Form */}
        <div className="vip-card mb-8">
          <div className="vip-card-header">
            <h2 className="text-2xl font-bold">
              {editingTour ? 'Edit Tour' : 'Create New Tour'}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Tour Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Summer Concert Series"
                  required
                />

                <Input
                  label="Date & Time"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  required
                />

                <Input
                  label="Venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Madison Square Garden"
                  required
                />

                <Input
                  label="Artists"
                  name="artists"
                  value={formData.artists}
                  onChange={handleChange}
                  placeholder="Artist Name, Featured Artist"
                  required
                />

                <Input
                  label="Ticket Limit"
                  name="ticket_limit"
                  type="number"
                  value={formData.ticket_limit}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <Textarea
                label="Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tour description..."
                rows={3}
              />

              <Input
                label="Image URL (Optional)"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (visible to fans)
                </label>
              </div>

              <div className="flex gap-4">
                {editingTour && (
                  <Button variant="outline" onClick={resetForm} type="button">
                    Cancel Edit
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : editingTour
                    ? 'Update Tour'
                    : 'Create Tour'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Tours List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">All Tours ({tours.length})</h2>

          {tours.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No tours created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tours.map((tour) => (
                <div key={tour.id} className="vip-card">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{tour.title}</h3>
                          {tour.is_active ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <strong>Date:</strong>{' '}
                            {new Date(tour.date).toLocaleString()}
                          </div>
                          <div>
                            <strong>Venue:</strong> {tour.venue}
                          </div>
                          <div>
                            <strong>City:</strong> {tour.city}
                          </div>
                          <div>
                            <strong>Artists:</strong> {tour.artists}
                          </div>
                          <div>
                            <strong>Tickets:</strong> {tour.tickets_claimed} /{' '}
                            {tour.ticket_limit}
                          </div>
                          <div>
                            <strong>Available:</strong>{' '}
                            {tour.is_available ? 'Yes' : 'No'}
                          </div>
                        </div>

                        {tour.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {tour.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tour)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(tour.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Success!"
        message="Tour operation completed successfully"
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

export default Admin;