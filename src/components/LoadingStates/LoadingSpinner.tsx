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

import React, { useState, useEffect } from 'react';
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      
      // Calculate progress based on elapsed time (estimate 30 seconds max)
      const progressPercent = Math.min((elapsed / 30) * 100, 95); // Cap at 95% until complete
      setProgress(progressPercent);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className={`loading-spinner ${size}`}>
        {/* Loading content */}
        <div className="loading-content">
          <div className="loading-icon">🔍</div>
          <h3 className="loading-message">{message}</h3>
          <p className="loading-sub-message">
            Loading time: {formatTime(elapsedTime)}
            {subMessage && ` • ${subMessage}`}
          </p>
          
          {/* Time-based Progress Bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Screen reader text */}
      <span className="sr-only">
        {message} Loading for {formatTime(elapsedTime)}
      </span>
    </div>
  );
};

export default LoadingSpinner;