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
import { CodeRecommendation, CodeFeedback, CodeSuggestion, getMBSOnlineUrl, EnhancedCodeRecommendation, ConflictRule } from '../../types/api.types';
import { FeedbackPanel } from '../FeedbackPanel';
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
  /** Handler for feedback submission */
  onFeedbackSubmit?: (feedback: CodeFeedback) => void;
  /** Handler for suggestion submission */
  onSuggestionSubmit?: (suggestion: CodeSuggestion) => void;
  /** Existing feedback for this code */
  existingFeedback?: CodeFeedback;
  
  // Enhanced selection functionality
  /** Current selection state of this code */
  selectionState?: 'selected' | 'available' | 'compatible' | 'conflict' | 'blocked';
  /** Handler for selection toggle */
  onToggleSelection?: (code: string, recommendation: EnhancedCodeRecommendation) => void;
  /** Conflicts preventing selection */
  conflicts?: ConflictRule[];
  /** Compatible codes that can be selected with this one */
  compatibleCodes?: string[];
  /** Suggestions for resolving conflicts */
  suggestions?: string[];
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
  onFeedbackSubmit,
  onSuggestionSubmit,
  existingFeedback,
  selectionState = 'available',
  onToggleSelection,
  conflicts = [],
  compatibleCodes = [],
  suggestions = [],
}) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

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

  /**
   * Handle selection toggle
   */
  const handleToggleSelection = () => {
    if (onToggleSelection && selectionState !== 'blocked') {
      onToggleSelection(recommendation.code, recommendation as EnhancedCodeRecommendation);
    }
  };

  /**
   * Get selection button text and icon
   */
  const getSelectionButtonContent = () => {
    switch (selectionState) {
      case 'selected':
        return { icon: '🔄', text: 'Toggle', disabled: false };
      case 'available':
        return { icon: '➕', text: 'Select', disabled: false };
      case 'compatible':
        return { icon: '➕', text: 'Select', disabled: false };
      case 'conflict':
        return { icon: '⚠️', text: 'Conflict', disabled: false };
      case 'blocked':
        return { icon: '🚫', text: 'Blocked', disabled: true };
      default:
        return { icon: '➕', text: 'Select', disabled: false };
    }
  };

  /**
   * Get selection checkbox icon
   */
  const getCheckboxIcon = () => {
    switch (selectionState) {
      case 'selected':
        return '☑️';
      case 'blocked':
        return '🚫';
      case 'conflict':
        return '⚠️';
      default:
        return '⬜';
    }
  };

  return (
    <div 
      className={`mbs-code-card ${confidenceLevel} ${selectionState}`}
      onClick={onCardClick}
      data-testid="mbs-code-card"
      aria-selected={isSelected}
      aria-describedby={conflicts.length > 0 ? `conflicts-${recommendation.code}` : undefined}
    >
      {/* Selection Badge (for selected state) */}
      {selectionState === 'selected' && (
        <div className="selection-badge">SELECTED</div>
      )}

      {/* Card Header */}
      <div className="card-header">
        {/* Selection Checkbox */}
        {onToggleSelection && (
          <div className="selection-controls">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleToggleSelection}
              className="selection-checkbox"
              aria-label={`Select MBS code ${recommendation.code}`}
              disabled={selectionState === 'blocked'}
            />
            <span className="checkbox-icon" aria-hidden="true">
              {getCheckboxIcon()}
            </span>
          </div>
        )}

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

      {/* Compatibility and Conflict Indicators */}
      {compatibleCodes.length > 0 && selectionState === 'compatible' && (
        <div className="compatibility-indicator">
          <span className="indicator-icon">✅</span>
          <span className="indicator-text">
            Compatible with: {compatibleCodes.join(', ')}
          </span>
        </div>
      )}

      {conflicts.length > 0 && (
        <div 
          className={`conflict-indicator ${conflicts[0]?.severity}`}
          id={`conflicts-${recommendation.code}`}
        >
          {conflicts.map((conflict, index) => (
            <div key={index} className="conflict-item">
              <span className="conflict-icon">
                {conflict.severity === 'blocking' ? '🚫' : '⚠️'}
              </span>
              <span className="conflict-text">
                {selectionState === 'blocked' ? 'BLOCKED: ' : 'Conflicts with: '}
                {conflict.conflictingCodes.filter(code => code !== recommendation.code).join(', ')} 
                ({conflict.reason.replace('_', ' ')})
              </span>
              <p className="conflict-message">{conflict.message}</p>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && selectionState === 'blocked' && (
        <div className="suggestions-indicator">
          <span className="suggestion-icon">💡</span>
          <div className="suggestion-content">
            <strong>Suggestion:</strong>
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Status Announcement for Screen Readers */}
      {(conflicts.length > 0 || suggestions.length > 0) && (
        <div className="sr-only" role="status" aria-live="polite">
          {selectionState === 'blocked' ? 'This code is blocked due to conflicts' :
           selectionState === 'conflict' ? 'This code has conflicts' :
           selectionState === 'compatible' ? 'This code is compatible with selected codes' :
           ''}
        </div>
      )}

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
        {/* Selection Button */}
        {onToggleSelection && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              handleToggleSelection();
            }}
            className={`selection-button ${selectionState}`}
            type="button"
            disabled={getSelectionButtonContent().disabled}
            aria-describedby={selectionState === 'conflict' || selectionState === 'blocked' ? `conflicts-${recommendation.code}` : undefined}
          >
            <span className="selection-icon" aria-hidden="true">
              {getSelectionButtonContent().icon}
            </span>
            {getSelectionButtonContent().text}
          </button>
        )}

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

        {onFeedbackSubmit && onSuggestionSubmit && (
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className={`feedback-button ${existingFeedback ? 'has-feedback' : ''}`}
            type="button"
            title="Provide feedback on this recommendation"
          >
            <span className="feedback-icon">💬</span>
            {existingFeedback ? 'Update Feedback' : 'Feedback'}
            {existingFeedback && (
              <span className={`feedback-indicator ${existingFeedback.rating}`}>
                {existingFeedback.rating === 'positive' ? '👍' : 
                 existingFeedback.rating === 'negative' ? '👎' : '🤷'}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Feedback Panel */}
      {showFeedback && onFeedbackSubmit && onSuggestionSubmit && (
        <FeedbackPanel
          code={recommendation.code}
          description={recommendation.description}
          onFeedbackSubmit={(feedback: CodeFeedback) => {
            onFeedbackSubmit(feedback);
            setShowFeedback(false);
          }}
          onSuggestionSubmit={(suggestion: CodeSuggestion) => {
            onSuggestionSubmit(suggestion);
            // Keep panel open for potential additional feedback
          }}
          existingFeedback={existingFeedback}
          isExpanded={true}
          onToggle={() => setShowFeedback(false)}
        />
      )}

      {/* Accessibility Label */}
      <div className="sr-only">
        MBS Code {recommendation.code}: {recommendation.description}. 
        Confidence: {confidencePercentage}%. 
        Schedule Fee: {formatCurrency(recommendation.schedule_fee)}.
        Selection status: {selectionState === 'selected' ? 'Selected' : 
                          selectionState === 'blocked' ? 'Blocked due to conflicts' :
                          selectionState === 'conflict' ? 'Has conflicts' :
                          selectionState === 'compatible' ? 'Compatible with selection' :
                          'Available for selection'}.
        {conflicts.length > 0 && ` Conflicts: ${conflicts.map(c => c.message).join(', ')}`}
        {compatibleCodes.length > 0 && ` Compatible with codes: ${compatibleCodes.join(', ')}`}
        {recommendation.reasoning && ` Reasoning: ${recommendation.reasoning}`}
      </div>
    </div>
  );
};

export default MBSCodeCard;