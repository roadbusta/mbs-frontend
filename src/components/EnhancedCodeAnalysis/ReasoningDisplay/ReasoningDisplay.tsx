/**
 * Reasoning Display Component
 * 
 * Displays detailed clinical reasoning for code recommendations
 * with organized sections and clear visual hierarchy.
 */

import React from 'react';
import { DetailedReasoning, ConfidenceFactors } from '../../../types/enhancedAnalysis.types';
import './ReasoningDisplay.css';

interface ReasoningDisplayProps {
  /** Detailed reasoning information */
  reasoning: DetailedReasoning;
  /** Confidence factors */
  confidenceFactors: ConfidenceFactors;
  /** Whether to show all sections by default */
  expanded?: boolean;
}

const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  reasoning,
  confidenceFactors
}) => {
  return (
    <div className="reasoning-display" role="region" aria-label="Detailed clinical reasoning">
      {/* Primary Evidence */}
      <div className="reasoning-section">
        <h4 className="reasoning-section__title">Primary Evidence</h4>
        <ul className="evidence-list">
          {reasoning.primaryEvidence.map((evidence, index) => (
            <li key={index} className="evidence-item evidence-item--primary">
              <span className="evidence-marker">●</span>
              <span className="evidence-text">{evidence}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Supporting Factors */}
      <div className="reasoning-section">
        <h4 className="reasoning-section__title">Supporting Factors</h4>
        <ul className="evidence-list">
          {reasoning.supportingFactors.map((factor, index) => (
            <li key={index} className="evidence-item evidence-item--supporting">
              <span className="evidence-marker">◦</span>
              <span className="evidence-text">{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Clinical Context */}
      {reasoning.clinicalContext && (
        <div className="reasoning-section">
          <h4 className="reasoning-section__title">Clinical Context</h4>
          <div className="clinical-context">
            <p>{reasoning.clinicalContext}</p>
          </div>
        </div>
      )}

      {/* Confidence Factors */}
      <div className="reasoning-section">
        <h4 className="reasoning-section__title">Confidence Factors</h4>
        
        {confidenceFactors.positiveFactors.length > 0 && (
          <div className="confidence-factors-group">
            <h5 className="factors-group-title factors-group-title--positive">
              Factors Increasing Confidence
            </h5>
            <ul className="factors-list">
              {confidenceFactors.positiveFactors.map((factor, index) => (
                <li key={index} className="factor-item factor-item--positive">
                  <span className="factor-impact">+{Math.abs(factor.impact * 100).toFixed(0)}%</span>
                  <span className="factor-description">{factor.description}</span>
                  <span className="factor-category">{factor.category}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {confidenceFactors.negativeFactors.length > 0 && (
          <div className="confidence-factors-group">
            <h5 className="factors-group-title factors-group-title--negative">
              Factors of Concern
            </h5>
            <ul className="factors-list">
              {confidenceFactors.negativeFactors.map((factor, index) => (
                <li key={index} className="factor-item factor-item--negative">
                  <span className="factor-impact">{Math.round(factor.impact * 100)}%</span>
                  <span className="factor-description">{factor.description}</span>
                  <span className="factor-category">{factor.category}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Alternatives Considered */}
      {reasoning.alternativesConsidered && reasoning.alternativesConsidered.length > 0 && (
        <div className="reasoning-section">
          <h4 className="reasoning-section__title">Alternatives Considered</h4>
          <div className="alternatives-list">
            {reasoning.alternativesConsidered.map((alternative, index) => (
              <div key={index} className="alternative-item">
                <div className="alternative-header">
                  <span className="alternative-code">Item {alternative.code}</span>
                  <span className="alternative-confidence">
                    {Math.round(alternative.alternativeConfidence * 100)}% confidence
                  </span>
                </div>
                <div className="alternative-reason">
                  <span className="reason-label">Not selected:</span>
                  <span className="reason-text">{alternative.rejectionReason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Assessment */}
      <div className="reasoning-section reasoning-section--summary">
        <h4 className="reasoning-section__title">Overall Assessment</h4>
        <div className={`overall-assessment assessment--${confidenceFactors.overallLevel.replace('_', '-')}`}>
          <div className="assessment-level">
            <span className="assessment-label">Confidence Level:</span>
            <span className="assessment-value">
              {confidenceFactors.overallLevel.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="assessment-score">
            <span className="score-label">Weighted Score:</span>
            <span className="score-value">
              {Math.round(reasoning.confidenceBreakdown.weightedScore * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReasoningDisplay;