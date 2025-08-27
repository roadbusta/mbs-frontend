/**
 * MBS Code Card Component
 * 
 * Individual card display for MBS code recommendations.
 * Professional medical interface with confidence indicators, reasoning, and actions.
 * 
 * Features:
 * - Confidence score visualization with color coding
 * - Medical reasoning display with expand/collapse
 * - Copy code functionality
 * - Direct MBS Online link integration
 * - Schedule fee display
 * - Professional medical card styling
 */

import React, { useState } from 'react';
import { CodeRecommendation, getMBSOnlineUrl } from '../../types/api.types';
import './MBSCodeCard.css';

interface MBSCodeCardProps {
  /** MBS code recommendation data */
  recommendation: CodeRecommendation;
  /** Display rank/position */
  rank: number;
  /** Confidence level for styling */
  confidenceLevel: 'high' | 'medium' | 'low';
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Handler for card click */
  onCardClick?: () => void;
}

/**
 * MBS Code Card Component
 */
const MBSCodeCard: React.FC<MBSCodeCardProps> = ({
  recommendation,
  rank,
  confidenceLevel,
  isSelected = false,
  onCardClick,
}) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  /**
   * Copy MBS code to clipboard
   */
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(recommendation.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  /**
   * Format confidence as percentage
   */
  const confidencePercentage = Math.round(recommendation.confidence * 100);

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  /**
   * Get confidence color class
   */
  const getConfidenceColorClass = (): string => {
    if (confidenceLevel === 'high') return 'confidence-high';
    if (confidenceLevel === 'medium') return 'confidence-medium';
    return 'confidence-low';
  };

  return (
    <div 
      className={`mbs-code-card ${confidenceLevel} ${isSelected ? 'selected' : ''}`}
      onClick={onCardClick}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="rank-badge">
          #{rank}
        </div>
        <div className="code-info">
          <div className="mbs-code">
            <span className="code-number">{recommendation.code}</span>
            {recommendation.category && (
              <span className="code-category">Cat {recommendation.category}</span>
            )}
          </div>
          <h3 className="code-description">{recommendation.description}</h3>
        </div>
        <div className="confidence-indicator">
          <div className={`confidence-circle ${getConfidenceColorClass()}`}>
            <span className="confidence-percentage">{confidencePercentage}%</span>
          </div>
          <span className="confidence-label">Confidence</span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="confidence-bar-container">
        <div className="confidence-bar">
          <div 
            className={`confidence-fill ${getConfidenceColorClass()}`}
            style={{ width: `${confidencePercentage}%` }}
          ></div>
        </div>
        <span className="confidence-text">
          {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)} Confidence
        </span>
      </div>

      {/* Schedule Fee */}
      <div className="fee-info">
        <span className="fee-label">Schedule Fee:</span>
        <span className="fee-amount">{formatCurrency(recommendation.schedule_fee)}</span>
      </div>

      {/* Medical Reasoning */}
      {recommendation.reasoning && (
        <div className="reasoning-section">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="reasoning-toggle"
            type="button"
            aria-expanded={showReasoning}
          >
            <span>Medical Reasoning</span>
            <span className={`expand-icon ${showReasoning ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {showReasoning && (
            <div className="reasoning-content">
              <p>{recommendation.reasoning}</p>
            </div>
          )}
        </div>
      )}

      {/* Card Actions */}
      <div className="card-actions">
        <button
          onClick={handleCopyCode}
          className={`copy-button ${copySuccess ? 'success' : ''}`}
          type="button"
          disabled={copySuccess}
        >
          {copySuccess ? (
            <>
              <span className="success-icon">✓</span>
              Copied!
            </>
          ) : (
            <>
              <span className="copy-icon">📋</span>
              Copy Code
            </>
          )}
        </button>

        <a
          href={getMBSOnlineUrl(recommendation.code)}
          target="_blank"
          rel="noopener noreferrer"
          className="mbs-link"
        >
          <span className="link-icon">🔗</span>
          View on MBS Online
        </a>
      </div>

      {/* Accessibility Label */}
      <div className="sr-only">
        MBS Code {recommendation.code}: {recommendation.description}. 
        Confidence: {confidencePercentage}%. 
        Schedule Fee: {formatCurrency(recommendation.schedule_fee)}.
        {recommendation.reasoning && ` Reasoning: ${recommendation.reasoning}`}
      </div>
    </div>
  );
};

export default MBSCodeCard;