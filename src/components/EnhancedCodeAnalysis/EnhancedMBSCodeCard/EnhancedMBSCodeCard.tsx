/**
 * Enhanced MBS Code Card Component
 * 
 * Phase 3 enhanced code card with advanced visualization, evidence highlighting,
 * detailed reasoning, and improved user interaction features.
 */

import React, { useState, useCallback, memo } from 'react';
import { EnhancedCodeRecommendation, EvidenceSpan } from '../../../types/enhancedAnalysis.types';
import ConfidenceVisualization from '../ConfidenceVisualization/ConfidenceVisualization';
import ReasoningDisplay from '../ReasoningDisplay/ReasoningDisplay';
import './EnhancedMBSCodeCard.css';

interface EnhancedMBSCodeCardProps {
  /** Enhanced code recommendation data */
  recommendation: EnhancedCodeRecommendation;
  /** Display rank/position */
  rank: number;
  /** Confidence level for styling */
  confidenceLevel: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Handler for card click */
  onCardClick?: () => void;
  /** Handler for selection toggle */
  onToggleSelection?: (code: string, recommendation: EnhancedCodeRecommendation) => void;
  /** Handler for evidence highlighting */
  onEvidenceHighlight?: (evidenceSpan: EvidenceSpan) => void;
  /** Whether to show detailed information by default */
  showDetailsByDefault?: boolean;
}

/**
 * Enhanced MBS Code Card Component
 */
const EnhancedMBSCodeCard: React.FC<EnhancedMBSCodeCardProps> = memo(({
  recommendation,
  rank,
  confidenceLevel,
  isSelected = false,
  onCardClick,
  onToggleSelection,
  onEvidenceHighlight,
  showDetailsByDefault = false
}) => {
  const [showReasoning, setShowReasoning] = useState(showDetailsByDefault);

  // Calculate confidence percentage
  const confidencePercentage = Math.round(recommendation.confidence * 100);

  // Handle card click
  const handleCardClick = useCallback(() => {
    onCardClick?.();
  }, [onCardClick]);

  // Handle selection toggle
  const handleSelectionToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection?.(recommendation.code, recommendation);
  }, [onToggleSelection, recommendation]);

  // Handle reasoning toggle
  const handleReasoningToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReasoning(prev => !prev);
  }, []);

  // Handle evidence span hover
  const handleEvidenceHover = useCallback((evidenceSpan: EvidenceSpan) => {
    onEvidenceHighlight?.(evidenceSpan);
  }, [onEvidenceHighlight]);

  // Format currency
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // Get card CSS classes
  const getCardClasses = () => {
    const classes = ['enhanced-code-card'];
    
    if (isSelected) classes.push('enhanced-code-card--selected');
    if (recommendation.selectionState) classes.push(`enhanced-code-card--${recommendation.selectionState}`);
    classes.push(`enhanced-code-card--confidence-${confidenceLevel}`);
    
    return classes.join(' ');
  };

  // Get selection button text
  const getSelectionButtonText = () => {
    if (isSelected) return 'Selected';
    if (recommendation.selectionState === 'conflict') return 'Cannot Select';
    if (recommendation.selectionState === 'blocked') return 'Blocked';
    return 'Select Code';
  };

  // Check if selection is disabled
  const isSelectionDisabled = () => {
    return recommendation.selectionState === 'conflict' || 
           recommendation.selectionState === 'blocked';
  };

  return (
    <div 
      className={getCardClasses()}
      data-testid="enhanced-code-card"
      tabIndex={0}
      onClick={handleCardClick}
      role="article"
      aria-label={`MBS Item ${recommendation.code} recommendation with ${confidencePercentage}% confidence`}
    >
      {/* Header Section */}
      <div className="enhanced-code-card__header">
        <div className="enhanced-code-card__rank">
          #{rank}
        </div>
        
        <div className="enhanced-code-card__main">
          <div className="enhanced-code-card__code">
            <h3>Item {recommendation.code}</h3>
          </div>
          
          <div className="enhanced-code-card__description">
            {recommendation.description}
          </div>
        </div>

        <ConfidenceVisualization
          confidence={recommendation.confidence}
          confidenceLevel={confidenceLevel}
          confidenceFactors={recommendation.confidenceFactors}
          confidenceBreakdown={recommendation.detailedReasoning.confidenceBreakdown}
        />
      </div>

      {/* Evidence Section */}
      <div className="enhanced-code-card__evidence">
        <div className="evidence-summary">
          <span className="evidence-count">
            {recommendation.evidenceSpans.length} evidence spans
          </span>
          <div className="evidence-categories">
            {Array.from(new Set(recommendation.evidenceSpans.map(span => span.category))).map(category => (
              <span key={category} className={`evidence-category evidence-category--${category}`}>
                {category.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="evidence-spans">
          {recommendation.evidenceSpans.map((span, index) => (
            <div
              key={index}
              className="evidence-span"
              data-testid={`evidence-span-${index}`}
              onMouseEnter={() => handleEvidenceHover(span)}
              title={`${span.category}: ${span.text} (${Math.round(span.relevanceScore * 100)}% relevant)`}
            >
              <span className="evidence-text">{span.text}</span>
              <span className="evidence-score">{Math.round(span.relevanceScore * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Information */}
      <div className="enhanced-code-card__fees">
        <div className="fee-main">
          <div className="schedule-fee">
            <span className="fee-label">Schedule Fee</span>
            <span className="fee-amount">{formatCurrency(recommendation.feeCalculation.scheduleFee)}</span>
          </div>
          <div className="total-fee">
            <span className="fee-label">Total (inc. GST)</span>
            <span className="fee-amount total">{formatCurrency(recommendation.feeCalculation.totalFee)}</span>
          </div>
        </div>
        
        <div className="fee-details">
          <div className="medicare-info">
            <span>Medicare Rebate: {formatCurrency(recommendation.feeCalculation.medicareRebate)}</span>
            <span>Patient Gap: {formatCurrency(recommendation.feeCalculation.patientGap)}</span>
          </div>
          
          {recommendation.feeCalculation.bulkBillingEligible && (
            <div 
              className="bulk-billing bulk-billing--available"
              data-testid="bulk-billing-indicator"
            >
              <span>✓ Bulk billing available</span>
            </div>
          )}
        </div>

        {recommendation.feeCalculation.feeNotes && recommendation.feeCalculation.feeNotes.length > 0 && (
          <div className="fee-notes">
            {recommendation.feeCalculation.feeNotes.map((note, index) => (
              <span key={index} className="fee-note">{note}</span>
            ))}
          </div>
        )}
      </div>

      {/* Conflicts and Compatibility */}
      {(recommendation.conflicts.length > 0 || recommendation.compatibleCodes.length > 0) && (
        <div className="enhanced-code-card__compatibility">
          {recommendation.conflicts.length > 0 && (
            <div className="conflicts">
              {recommendation.conflicts.map((conflict, index) => (
                <div key={index} className={`conflict conflict--${conflict.severity}`}>
                  <span className="conflict-text">
                    Conflicts with Item {conflict.conflictingCode}: {conflict.description}
                  </span>
                  {conflict.resolution && (
                    <span className="conflict-resolution">{conflict.resolution}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {recommendation.compatibleCodes.length > 0 && (
            <div className="compatible-codes">
              <span>Compatible with Items: {recommendation.compatibleCodes.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Reasoning Section */}
      <div className="enhanced-code-card__reasoning">
        <button
          className="reasoning-toggle"
          onClick={handleReasoningToggle}
          aria-label={`${showReasoning ? 'Hide' : 'Show'} detailed reasoning for Item ${recommendation.code}`}
          aria-expanded={showReasoning}
        >
          {showReasoning ? 'Hide Detailed Reasoning' : 'Show Detailed Reasoning'}
          <span className={`reasoning-arrow ${showReasoning ? 'reasoning-arrow--up' : 'reasoning-arrow--down'}`}>
            ▼
          </span>
        </button>

        {showReasoning && (
          <ReasoningDisplay 
            reasoning={recommendation.detailedReasoning}
            confidenceFactors={recommendation.confidenceFactors}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="enhanced-code-card__actions">
        <button
          className={`selection-button ${isSelected ? 'selection-button--selected' : ''} ${isSelectionDisabled() ? 'selection-button--disabled' : ''}`}
          onClick={handleSelectionToggle}
          disabled={isSelectionDisabled()}
          aria-label={`Select Item ${recommendation.code}`}
        >
          {getSelectionButtonText()}
        </button>
        
        <button className="details-button" onClick={handleCardClick}>
          View Details
        </button>
      </div>

      {/* Confidence breakdown is handled by ConfidenceVisualization component */}
    </div>
  );
});

EnhancedMBSCodeCard.displayName = 'EnhancedMBSCodeCard';

export default EnhancedMBSCodeCard;