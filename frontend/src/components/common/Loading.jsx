/**
 * Loading Component
 * Various loading indicators
 */

import React from 'react';

/**
 * Spinner Loader
 */
export const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-6',
  };
  
  const colors = {
    primary: 'border-gray-200 border-t-primary',
    white: 'border-gray-300 border-t-white',
    secondary: 'border-gray-200 border-t-secondary',
  };
  
  return (
    <div
      className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
      style={{ animation: 'spin 1s linear infinite' }}
    />
  );
};

/**
 * Full Page Loader
 */
export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

/**
 * Section Loader
 */
export const SectionLoader = ({ message = 'Loading...', height = '300px' }) => {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for cards/content
 */
export const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="vip-card p-6 animate-shimmer">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton Text
 */
export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

/**
 * Loading Dots
 */
export const LoadingDots = () => {
  return (
    <div className="flex space-x-2 justify-center items-center">
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

/**
 * Loading Button Content
 */
export const ButtonLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Spinner size="sm" color="white" />
      <span>{text}</span>
    </div>
  );
};

/**
 * Gold Shimmer Loader (VIP themed)
 */
export const GoldShimmerLoader = ({ text = 'Generating your VIP tickets...' }) => {
  return (
    <div className="text-center py-8">
      <div className="inline-block">
        <div className="text-4xl font-bold text-gradient-gold gold-shine mb-4">
          VIP
        </div>
      </div>
      <p className="text-lg text-gray-600">{text}</p>
      <LoadingDots />
    </div>
  );
};

/**
 * Default Loading Component
 */
const Loading = ({ 
  type = 'spinner', 
  size = 'md', 
  message = '',
  fullPage = false 
}) => {
  if (fullPage) {
    return <FullPageLoader message={message} />;
  }
  
  switch (type) {
    case 'spinner':
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Spinner size={size} />
            {message && <p className="mt-4 text-gray-600">{message}</p>}
          </div>
        </div>
      );
      
    case 'dots':
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingDots />
          {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
      );
      
    case 'gold':
      return <GoldShimmerLoader text={message} />;
      
    case 'skeleton':
      return <SkeletonCard count={3} />;
      
    default:
      return <Spinner size={size} />;
  }
};

export default Loading;