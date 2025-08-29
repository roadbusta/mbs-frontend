/**
 * Header Component
 * 
 * Application header with title and description.
 * Provides clear branding and context for the medical coding interface.
 * 
 * Features:
 * - Professional medical branding
 * - Clean, focused design
 * - Responsive design
 * - Accessibility support
 */

import React from 'react';
import './Header.css';

/**
 * Application Header Component
 */
const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Branding Section */}
          <div className="header-branding">
            <h1 className="header-title">
              MBS Coding Assistant
            </h1>
            <p className="header-subtitle">
              AI-Powered Medicare Benefits Schedule Code Recommendations
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="header-status">
          <div className="status-indicators">
            {/* Connection Status */}
            <div className="status-indicator">
              <div className="status-dot live"></div>
              <span className="status-text">
                Live API Connection
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;