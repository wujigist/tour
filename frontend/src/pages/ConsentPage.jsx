/**
 * Consent Page
 * Consent form submission page with payment verification
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFan } from '../context/FanContext';
import ConsentForm from '../components/ConsentForm';
import { GoldShimmerLoader } from '../components/common/Loading';
import { SuccessModal, ErrorModal } from '../components/common/Modal';
import { consentAPI } from '../services/api';
import Button from '../components/common/Button';

const ADMIN_TELEGRAM = '@VIPTicketsAdmin'; // Replace with actual admin telegram handle
const PAYMENT_FEE = 200;

const ConsentPage = () => {
  const navigate = useNavigate();
  const { fan, updateConsent, hasConsent } = useFan();
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  // Redirect if already has consent
  useEffect(() => {
    if (hasConsent) {
      navigate('/tickets');
    }
  }, [hasConsent, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      // Upload photo ID if provided
      if (formData.photo_id) {
        try {
          await consentAPI.uploadPhotoId(fan.id, formData.photo_id);
        } catch (error) {
          console.error('Error uploading photo ID:', error);
          // Continue even if photo upload fails
        }
      }

      // Submit consent form
      const consentData = {
        fan_id: fan.id,
        agreed_to_terms: formData.agreed_to_terms,
        agreed_to_privacy: formData.agreed_to_privacy,
        agreed_to_marketing: formData.agreed_to_marketing,
        age_verified: formData.age_verified,
        date_of_birth: formData.date_of_birth || null,
        confirmed_name: formData.confirmed_name,
        confirmed_email: formData.confirmed_email,
        confirmed_phone: formData.confirmed_phone,
        signature_name: formData.signature_name,
      };

      const response = await consentAPI.submit(consentData);
      
      // Update context
      updateConsent(response.consent);
      
      setShowSuccess(true);
    } catch (error) {
      console.error('Consent submission error:', error);
      setErrorMessage(
        error.response?.data?.detail || 'Failed to submit consent. Please try again.'
      );
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/tickets');
  };

  const handleTelegramClick = () => {
    window.open(`https://t.me/${ADMIN_TELEGRAM.replace('@', '')}`, '_blank');
  };

  // Redirect if not logged in
  if (!fan) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <GoldShimmerLoader text="Submitting your consent and unlocking tickets..." />
      </div>
    );
  }

  // Show payment requirement if not verified
  if (!fan.is_verified) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Payment Required
            </h1>
            <p className="text-gray-600 text-lg">
              Complete payment to unlock the consent form
            </p>
          </div>

          {/* Payment Card */}
          <div className="vip-card p-8 mb-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-4">
                <svg
                  className="w-10 h-10 text-amber-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold mb-2">
                Processing Fee: ${PAYMENT_FEE}
              </h2>
              <p className="text-gray-600 mb-6">
                A one-time processing fee is required to proceed with ticket generation
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
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
                  <h3 className="font-bold text-blue-900 mb-2">Payment Instructions</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Click the button below to contact our admin via Telegram</li>
                    <li>Provide your registration code: <strong className="font-mono bg-white px-2 py-1 rounded">{fan.registration_code}</strong></li>
                    <li>Complete the ${PAYMENT_FEE} payment as instructed</li>
                    <li>Once verified, you'll be able to access the consent form</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                fullWidth
                onClick={handleTelegramClick}
                size="lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Contact Admin on Telegram
              </Button>

              <p className="text-center text-sm text-gray-600">
                Telegram: <strong className="text-primary">{ADMIN_TELEGRAM}</strong>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-800 text-center">
                  <strong>Note:</strong> After payment, please allow a few minutes for verification. 
                  You may need to refresh this page once your payment is confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* What You'll Get */}
          <div className="vip-card p-6">
            <h3 className="text-xl font-bold mb-4">What's Included</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700">Access to exclusive VIP tours</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700">Digital VIP tickets with QR codes</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700">Secure ticket management</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-700">Priority customer support</p>
              </div>
            </div>
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
            Consent Form
          </h1>
          <p className="text-gray-600 text-lg">
            Complete this form to unlock your VIP tickets
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { step: 1, label: 'Register', completed: true },
              { step: 2, label: 'Select Tours', completed: true },
              { step: 3, label: 'Consent', completed: false },
              { step: 4, label: 'Get Tickets', completed: false },
            ].map((item, index, array) => (
              <React.Fragment key={item.step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      item.completed
                        ? 'bg-primary text-white'
                        : item.step === 3
                        ? 'bg-primary-200 text-primary-700 ring-4 ring-primary-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {item.completed ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      item.step
                    )}
                  </div>
                  <span className="text-xs mt-2 font-medium text-gray-600">
                    {item.label}
                  </span>
                </div>
                
                {index < array.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      item.completed ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Payment Success Banner */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-8">
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
              <h3 className="font-bold text-green-900 mb-2">Payment Verified ✓</h3>
              <p className="text-green-800 text-sm">
                Your payment has been confirmed. You can now complete the consent form below to unlock your tickets.
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
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
              <h3 className="font-bold text-blue-900 mb-2">Almost There!</h3>
              <p className="text-blue-800 text-sm">
                This consent form is required to generate and unlock your VIP tickets. 
                All information will be kept secure and private. Once submitted, your 
                tickets will be immediately available for download.
              </p>
            </div>
          </div>
        </div>

        {/* Consent Form */}
        <ConsentForm 
          fanData={fan} 
          onSubmit={handleSubmit} 
          loading={loading}
          onShowTerms={() => setShowTerms(true)}
        />
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl max-h-[80vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Terms and Conditions</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <h3>1. Payment Terms</h3>
              <p>
                By proceeding with payment, you acknowledge that a non-refundable processing fee of ${PAYMENT_FEE} is required 
                to access VIP ticket services. This fee covers ticket generation, processing, and administrative costs.
              </p>

              <h3>2. Ticket Access</h3>
              <p>
                Upon successful payment verification and consent form submission, you will receive digital VIP tickets 
                for your selected tours. Tickets are non-transferable and must be presented at the venue.
              </p>

              <h3>3. Age Requirement</h3>
              <p>
                You must be 18 years of age or older to purchase and use VIP tickets. By agreeing to these terms, 
                you confirm that you meet this age requirement.
              </p>

              <h3>4. Refund Policy</h3>
              <p>
                The ${PAYMENT_FEE} processing fee is non-refundable. Tour cancellations or changes are subject to 
                the venue's policies. We are not responsible for event cancellations.
              </p>

              <h3>5. Data Usage</h3>
              <p>
                Your personal information will be used solely for ticket processing and communication regarding 
                your VIP access. We do not sell or share your information with third parties.
              </p>

              <h3>6. Liability</h3>
              <p>
                We are not liable for any incidents that occur during tours or events. Attendees participate at 
                their own risk. Venue rules and regulations must be followed at all times.
              </p>

              <h3>7. Code of Conduct</h3>
              <p>
                VIP ticket holders must maintain appropriate behavior at all times. Disruptive behavior may result 
                in removal from the venue without refund.
              </p>

              <h3>8. Modifications</h3>
              <p>
                We reserve the right to modify these terms at any time. Continued use of our services constitutes 
                acceptance of any changes.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="primary" onClick={() => setShowTerms(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="🎉 Tickets Unlocked!"
        message={
          <div className="text-center">
            <p className="mb-4">
              Your consent has been submitted successfully!
            </p>
            <p className="text-sm text-gray-600">
              Your VIP tickets are now unlocked and ready to download.
            </p>
          </div>
        }
        buttonText="View My Tickets"
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Submission Error"
        message={errorMessage}
      />
    </div>
  );
};

export default ConsentPage;