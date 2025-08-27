/**
 * Loading Spinner Component
 * 
 * Professional loading indicator for API processing states.
 * Shows progress animation with contextual messaging for medical analysis.
 * 
 * Features:
 * - Medical-themed loading animation
 * - Progress indication and messaging
 * - Responsive design
 * - Accessibility support
 */

import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  /** Primary loading message */
  message?: string;
  /** Secondary message or time estimate */
  subMessage?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Loading Spinner Component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Processing...',
  subMessage,
  size = 'medium',
}) => {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className={`loading-spinner ${size}`}>
        {/* Animated spinner */}
        <div className="spinner-ring">
          <div className="spinner-inner"></div>
        </div>
        
        {/* Loading content */}
        <div className="loading-content">
          <h3 className="loading-message">{message}</h3>
          {subMessage && (
            <p className="loading-sub-message">{subMessage}</p>
          )}
          
          {/* Progress indicator */}
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          
          {/* Processing steps */}
          <div className="processing-steps">
            <div className="step active">
              <div className="step-indicator"></div>
              <span>Analyzing consultation</span>
            </div>
            <div className="step">
              <div className="step-indicator"></div>
              <span>Matching MBS codes</span>
            </div>
            <div className="step">
              <div className="step-indicator"></div>
              <span>Generating recommendations</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Screen reader text */}
      <span className="sr-only">
        {message} {subMessage}
      </span>
    </div>
  );
};

export default LoadingSpinner;