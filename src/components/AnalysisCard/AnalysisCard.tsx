/**
 * Analysis Card Component
 * 
 * Displays analysis status, requirements, and controls in a side panel.
 * Shows real-time feedback on input readiness and analysis progress.
 * 
 * Features:
 * - Real-time status indicators for input requirements
 * - Progress feedback during analysis
 * - Action buttons (Analyze, Clear) with proper states
 * - Professional medical-grade UI design
 */

import React from 'react';
import './AnalysisCard.css';

interface AnalysisCardProps {
  /** Whether all requirements are met for analysis */
  isReady: boolean;
  /** Current character count */
  characterCount: number;
  /** Minimum required characters */
  minCharacters: number;
  /** Maximum allowed characters */
  maxCharacters: number;
  /** Whether consultation context is selected */
  contextSelected: boolean;
  /** Whether analysis is currently in progress */
  isAnalyzing: boolean;
  /** Whether input has any content */
  hasContent: boolean;
  /** Handler for analyze button click */
  onAnalyze: () => void;
  /** Handler for clear button click */
  onClear: () => void;
}

/**
 * Analysis Card Component
 */
const AnalysisCard: React.FC<AnalysisCardProps> = ({
  isReady,
  characterCount,
  minCharacters,
  maxCharacters,
  contextSelected,
  isAnalyzing,
  hasContent,
  onAnalyze,
  onClear,
}) => {
  const hasMinimumChars = characterCount >= minCharacters;

  return (
    <div className="analysis-card h-full flex flex-col">
      {/* Status Header */}
      <div className="analysis-header">
        <div className="analysis-title">
          <span className="analysis-icon">📋</span>
          <h3>Ready to Analyze</h3>
        </div>
        <div className={`analysis-status ${isReady ? 'ready' : 'waiting'}`}>
          {isAnalyzing ? 'Analyzing...' : isReady ? 'Ready' : 'Waiting for input...'}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="requirements-section">
        <h4>Requirements</h4>
        <div className="requirement-list">
          <div className={`requirement-item ${contextSelected ? 'met' : 'pending'}`}>
            <span className="requirement-icon">
              {contextSelected ? '✅' : '⭕'}
            </span>
            <span className="requirement-text">Context selected</span>
          </div>
          
          <div className={`requirement-item ${hasMinimumChars ? 'met' : 'pending'}`}>
            <span className="requirement-icon">
              {hasMinimumChars ? '✅' : '⭕'}
            </span>
            <span className="requirement-text">
              Min {minCharacters} characters ({characterCount}/{minCharacters})
            </span>
          </div>
        </div>
      </div>

      {/* Character Count */}
      <div className="character-progress">
        <div className="progress-label">
          Character Count: {characterCount}/{maxCharacters}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="analysis-actions">
        <button
          onClick={onAnalyze}
          disabled={!isReady || isAnalyzing}
          className="analyze-button primary"
        >
          {isAnalyzing ? (
            <>
              <span className="loading-spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              🔍 Analyze Consultation
            </>
          )}
        </button>
        
        <button
          onClick={onClear}
          disabled={isAnalyzing || !hasContent}
          className="clear-button secondary"
        >
          🗑️ Clear Input
        </button>
      </div>

      {/* Analysis Progress (shown during analysis) */}
      {isAnalyzing && (
        <div className="analysis-progress">
          <div className="progress-header">
            <span className="progress-icon">📊</span>
            <h4>Analysis Progress</h4>
          </div>
          <div className="progress-steps">
            <div className="progress-step active">
              <span className="step-icon">⏳</span>
              <span className="step-text">Analyzing consultation</span>
            </div>
            <div className="progress-step">
              <span className="step-icon">🔍</span>
              <span className="step-text">Finding relevant codes</span>
            </div>
            <div className="progress-step">
              <span className="step-icon">✨</span>
              <span className="step-text">Generating recommendations</span>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="analysis-help">
        <div className="help-icon">💡</div>
        <div className="help-text">
          <strong>Tip:</strong> Include consultation duration, symptoms, examination 
          findings, and treatment decisions for more accurate MBS code recommendations.
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;