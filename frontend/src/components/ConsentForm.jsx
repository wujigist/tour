/**
 * ConsentForm Component
 * Comprehensive consent form with all required fields
 */

import React, { useState } from 'react';
import Input, { Checkbox, FileInput } from './common/Input';
import Button from './common/Button';
import { validateEmail, validatePhone, validateAge, validateFileType, validateFileSize } from '../utils/validators';

const ConsentForm = ({ fanData, onSubmit, loading = false, onShowTerms }) => {
  const [formData, setFormData] = useState({
    agreed_to_terms: false,
    agreed_to_privacy: false,
    agreed_to_marketing: false,
    age_verified: false,
    date_of_birth: '',
    confirmed_name: fanData?.name || '',
    confirmed_email: fanData?.email || '',
    confirmed_phone: fanData?.phone || '',
    signature_name: '',
    photo_id: null,
  });

  const [errors, setErrors] = useState({});
  const [photoIdPreview, setPhotoIdPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validateFileType(file, allowedTypes)) {
      setErrors((prev) => ({
        ...prev,
        photo_id: 'Only JPEG and PNG images are allowed',
      }));
      return;
    }

    // Validate file size (5MB)
    if (!validateFileSize(file, 5)) {
      setErrors((prev) => ({
        ...prev,
        photo_id: 'File size must be less than 5MB',
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, photo_id: file }));
    setErrors((prev) => ({ ...prev, photo_id: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoIdPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    // Required checkboxes
    if (!formData.agreed_to_terms) {
      newErrors.agreed_to_terms = 'You must agree to the terms and conditions';
    }
    if (!formData.agreed_to_privacy) {
      newErrors.agreed_to_privacy = 'You must agree to the privacy policy';
    }
    if (!formData.age_verified) {
      newErrors.age_verified = 'You must confirm you are 18 years or older';
    }

    // Validated fields
    if (!formData.confirmed_name) {
      newErrors.confirmed_name = 'Name is required';
    }
    if (!formData.confirmed_email) {
      newErrors.confirmed_email = 'Email is required';
    } else if (!validateEmail(formData.confirmed_email)) {
      newErrors.confirmed_email = 'Please enter a valid email address';
    }
    if (formData.confirmed_phone && !validatePhone(formData.confirmed_phone)) {
      newErrors.confirmed_phone = 'Please enter a valid phone number';
    }

    // Age verification with DOB
    if (formData.date_of_birth && !validateAge(formData.date_of_birth)) {
      newErrors.date_of_birth = 'You must be at least 18 years old';
    }

    // Signature
    if (!formData.signature_name) {
      newErrors.signature_name = 'Digital signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-primary-50 border-l-4 border-primary p-4 rounded-lg">
        <h3 className="font-bold text-gray-900 mb-2">Important Notice</h3>
        <p className="text-sm text-gray-700">
          Please read and complete all sections carefully. Your consent is required to generate and access your VIP tickets.
        </p>
      </div>

      {/* Personal Information Confirmation */}
      <div className="vip-card p-6">
        <h3 className="text-xl font-bold mb-4">Confirm Your Information</h3>
        
        <Input
          label="Full Name"
          name="confirmed_name"
          value={formData.confirmed_name}
          onChange={handleChange}
          error={errors.confirmed_name}
          required
        />

        <Input
          label="Email Address"
          name="confirmed_email"
          type="email"
          value={formData.confirmed_email}
          onChange={handleChange}
          error={errors.confirmed_email}
          required
        />

        <Input
          label="Phone Number (Optional)"
          name="confirmed_phone"
          type="tel"
          value={formData.confirmed_phone}
          onChange={handleChange}
          error={errors.confirmed_phone}
          placeholder="(123) 456-7890"
        />
      </div>

      {/* Age Verification */}
      <div className="vip-card p-6">
        <h3 className="text-xl font-bold mb-4">Age Verification</h3>

        <Checkbox
          label="I confirm that I am 18 years of age or older"
          name="age_verified"
          checked={formData.age_verified}
          onChange={handleChange}
          error={errors.age_verified}
          required
        />

        <Input
          label="Date of Birth (Optional - for additional verification)"
          name="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={handleChange}
          error={errors.date_of_birth}
        />
      </div>

      {/* Photo ID Upload */}
      <div className="vip-card p-6">
        <h3 className="text-xl font-bold mb-4">Photo ID (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a photo of your ID for additional verification. This is optional but recommended.
        </p>

        <FileInput
          label="Upload Photo ID"
          name="photo_id"
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/jpg"
          error={errors.photo_id}
        />

        {photoIdPreview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={photoIdPreview}
              alt="ID Preview"
              className="max-w-xs rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Legal Agreements */}
      <div className="vip-card p-6">
        <h3 className="text-xl font-bold mb-4">Terms & Conditions</h3>

        <div className="space-y-4">
          <Checkbox
            label={
              <span>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={onShowTerms}
                  className="text-primary hover:underline font-semibold"
                >
                  Terms and Conditions
                </button>
              </span>
            }
            name="agreed_to_terms"
            checked={formData.agreed_to_terms}
            onChange={handleChange}
            error={errors.agreed_to_terms}
            required
          />

          <Checkbox
            label={
              <span>
                I agree to the{' '}
                <a href="/privacy" target="_blank" className="text-primary hover:underline font-semibold">
                  Privacy Policy
                </a>
              </span>
            }
            name="agreed_to_privacy"
            checked={formData.agreed_to_privacy}
            onChange={handleChange}
            error={errors.agreed_to_privacy}
            required
          />

          <Checkbox
            label="I agree to receive marketing communications (optional)"
            name="agreed_to_marketing"
            checked={formData.agreed_to_marketing}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Digital Signature */}
      <div className="vip-card p-6">
        <h3 className="text-xl font-bold mb-4">Digital Signature</h3>
        <p className="text-sm text-gray-600 mb-4">
          By typing your full name below, you agree that this constitutes a legal signature confirming that you acknowledge and agree to the above terms.
        </p>

        <Input
          label="Type your full name as your digital signature"
          name="signature_name"
          value={formData.signature_name}
          onChange={handleChange}
          error={errors.signature_name}
          placeholder="Your Full Name"
          required
        />

        {formData.signature_name && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-500 mb-2">Signature Preview:</p>
            <p className="text-2xl font-serif text-gray-900">
              {formData.signature_name}
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Consent & Unlock Tickets'}
        </Button>
      </div>

      {/* Footer Notice */}
      <div className="text-center text-sm text-gray-600">
        <p>
          By submitting this form, you acknowledge that you have read and understood all terms and conditions.
        </p>
      </div>
    </form>
  );
};

export default ConsentForm;