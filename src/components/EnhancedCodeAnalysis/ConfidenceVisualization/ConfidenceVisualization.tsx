/**
 * Confidence Visualization Component
 * 
 * Visual representation of confidence levels with detailed breakdown
 * and interactive elements for enhanced user understanding.
 */

import React, { useState, useRef } from 'react';
import { ConfidenceFactors, ConfidenceBreakdown } from '../../../types/enhancedAnalysis.types';
import './ConfidenceVisualization.css';

interface ConfidenceVisualizationProps {
  /** Confidence score (0-1) */
  confidence: number;
  /** Confidence level category */
  confidenceLevel: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  /** Detailed confidence factors */
  confidenceFactors: ConfidenceFactors;
  /** Confidence calculation breakdown */
  confidenceBreakdown: ConfidenceBreakdown;
  /** Callback for showing breakdown details */
  onShowBreakdown?: (show: boolean) => void;
  /** Whether to show breakdown by default */
  showBreakdownByDefault?: boolean;
}

const ConfidenceVisualization: React.FC<ConfidenceVisualizationProps> = ({
  confidence,
  confidenceLevel,
  confidenceFactors,
  confidenceBreakdown,
  onShowBreakdown,
  showBreakdownByDefault = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);

  const confidencePercentage = Math.round(confidence * 100);

  // Handle mouse enter
  const handleMouseEnter = () => {
    setShowTooltip(true);
    onShowBreakdown?.(true);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setShowTooltip(false);
    if (!showBreakdownByDefault) {
      onShowBreakdown?.(false);
    }
  };

  // Get confidence level color
  const getConfidenceColor = () => {
    switch (confidenceLevel) {
      case 'very_high': return '#0d7377';
      case 'high': return '#14a085';
      case 'medium': return '#f39c12';
      case 'low': return '#e67e22';
      case 'very_low': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  // Get confidence description
  const getConfidenceDescription = () => {
    switch (confidenceLevel) {
      case 'very_high': return 'Very High Confidence';
      case 'high': return 'High Confidence';
      case 'medium': return 'Medium Confidence';
      case 'low': return 'Low Confidence';
      case 'very_low': return 'Very Low Confidence';
      default: return 'Unknown Confidence';
    }
  };

  return (
    <div className="confidence-visualization">
      <div 
        className={`confidence-meter confidence-meter--${confidenceLevel}`}
        data-testid="confidence-meter"
        data-confidence={confidencePercentage}
        ref={meterRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`Confidence: ${confidencePercentage}%`}
        role="progressbar"
        aria-valuenow={confidencePercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="confidence-meter__track">
          <div 
            className="confidence-meter__fill"
            style={{ 
              width: `${confidencePercentage}%`,
              backgroundColor: getConfidenceColor()
            }}
          />
        </div>
        
        <div className="confidence-meter__label">
          <span className="confidence-percentage" aria-hidden="true">
            {confidencePercentage}%
          </span>
          <span className="confidence-level">
            {getConfidenceDescription()}
          </span>
        </div>
      </div>

      {/* Confidence Factors Summary */}
      <div className="confidence-factors-summary">
        <div className="factors-positive">
          <span className="factors-label">
            +{confidenceFactors.positiveFactors.length} positive factors
          </span>
        </div>
        {confidenceFactors.negativeFactors.length > 0 && (
          <div className="factors-negative">
            <span className="factors-label">
              -{confidenceFactors.negativeFactors.length} concerns
            </span>
          </div>
        )}
      </div>

      {/* Tooltip with breakdown details */}
      {showTooltip && (
        <div 
          className="confidence-tooltip"
          ref={tooltipRef}
          role="tooltip"
          aria-describedby="confidence-breakdown"
        >
          <div className="tooltip-header">
            <h4>Confidence Breakdown</h4>
          </div>
          
          <div className="breakdown-metrics">
            <div className="breakdown-item">
              <span className="metric-label">Evidence Strength</span>
              <span className="metric-value">
                {Math.round(confidenceBreakdown.evidenceStrength * 100)}%
              </span>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ width: `${confidenceBreakdown.evidenceStrength * 100}%` }}
                />
              </div>
            </div>
            
            <div className="breakdown-item">
              <span className="metric-label">Clinical Relevance</span>
              <span className="metric-value">
                {Math.round(confidenceBreakdown.clinicalRelevance * 100)}%
              </span>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ width: `${confidenceBreakdown.clinicalRelevance * 100}%` }}
                />
              </div>
            </div>
            
            <div className="breakdown-item">
              <span className="metric-label">Specificity Match</span>
              <span className="metric-value">
                {Math.round(confidenceBreakdown.specificityMatch * 100)}%
              </span>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ width: `${confidenceBreakdown.specificityMatch * 100}%` }}
                />
              </div>
            </div>
            
            <div className="breakdown-item">
              <span className="metric-label">Historical Accuracy</span>
              <span className="metric-value">
                {Math.round(confidenceBreakdown.historicalAccuracy * 100)}%
              </span>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ width: `${confidenceBreakdown.historicalAccuracy * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key factors */}
          <div className="key-factors">
            {confidenceFactors.positiveFactors.slice(0, 2).map((factor, index) => (
              <div key={index} className="factor-item factor-positive">
                <span className="factor-icon">+</span>
                <span className="factor-text">{factor.description}</span>
              </div>
            ))}
            
            {confidenceFactors.negativeFactors.slice(0, 2).map((factor, index) => (
              <div key={index} className="factor-item factor-negative">
                <span className="factor-icon">-</span>
                <span className="factor-text">{factor.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceVisualization;