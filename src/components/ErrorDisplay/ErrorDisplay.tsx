/**
 * Error Display Component
 * 
 * Professional error handling interface for medical applications.
 * Provides clear error messaging with recovery options and user guidance.
 * 
 * Features:
 * - Clear error messaging with medical context
 * - Retry functionality with loading states
 * - Multiple error type handling
 * - Accessibility support
 * - Professional medical UI styling
 */

import React from 'react';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  /** Error message to display */
  message: string;
  /** Optional detailed error information */
  details?: string;
  /** Handler for retry action */
  onRetry?: () => void;
  /** Whether retry action is available */
  canRetry?: boolean;
  /** Error type for styling */
  type?: 'error' | 'warning' | 'network' | 'timeout' | 'validation';
}

/**
 * Error icons for different error types
 */
const ERROR_ICONS = {
  error: '⚠️',
  warning: '⚠️',
  network: '🔌',
  timeout: '⏱️',
  validation: '📝',
};

/**
 * Error suggestions based on error type
 */
const ERROR_SUGGESTIONS = {
  error: [
    'Check your internet connection',
    'Try again in a few moments',
    'Contact support if the problem persists',
  ],
  warning: [
    'Review your input and try again',
    'Ensure all required fields are completed',
  ],
  network: [
    'Check your internet connection',
    'Verify the API service is available',
    'Try refreshing the page',
  ],
  timeout: [
    'The request took longer than expected',
    'Try with a shorter consultation note',
    'Check your internet connection speed',
  ],
  validation: [
    'Please check your input format',
    'Ensure consultation note meets minimum requirements',
    'Review the character count limits',
  ],
};

/**
 * Error Display Component
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  details,
  onRetry,
  canRetry = false,
  type = 'error',
}) => {
  const suggestions = ERROR_SUGGESTIONS[type] || ERROR_SUGGESTIONS.error;
  const icon = ERROR_ICONS[type] || ERROR_ICONS.error;

  return (
    <div className={`error-display ${type}`} role="alert" aria-live="assertive">
      <div className="error-container">
        {/* Error Header */}
        <div className="error-header">
          <div className="error-icon">
            <span>{icon}</span>
          </div>
          <div className="error-title">
            <h3>Analysis Failed</h3>
            <p className="error-type-label">
              {type.charAt(0).toUpperCase() + type.slice(1)} Error
            </p>
          </div>
        </div>

        {/* Error Content */}
        <div className="error-content">
          <div className="error-message">
            <p>{message}</p>
          </div>

          {details && (
            <div className="error-details">
              <details>
                <summary>Technical Details</summary>
                <div className="details-content">
                  <code>{details}</code>
                </div>
              </details>
            </div>
          )}

          {/* Suggestions */}
          <div className="error-suggestions">
            <h4>What you can do:</h4>
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Error Actions */}
        <div className="error-actions">
          {canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="retry-button"
              type="button"
            >
              <span className="retry-icon">🔄</span>
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="refresh-button"
            type="button"
          >
            Refresh Page
          </button>
        </div>

        {/* Help Information */}
        <div className="error-help">
          <p>
            <strong>Need help?</strong> If this problem continues, please contact technical support
            with the error details above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;