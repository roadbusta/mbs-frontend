/**
 * Consultation Input Component
 * 
 * Main input interface for entering consultation notes and triggering analysis.
 * Includes consultation context selection and character validation.
 * 
 * Features:
 * - Large text area with character counting (10-10,000 chars)
 * - Consultation context selection dropdown
 * - Input validation with visual feedback
 * - Clear and analyze actions
 * - Responsive design for various screen sizes
 */

import React from 'react';
import ContextSelector from '../ContextSelector/ContextSelector';
import { ConsultationContext } from '../../types/api.types';
import './ConsultationInput.css';

interface ConsultationInputProps {
  /** Current consultation note value */
  value: string;
  /** Handler for text changes */
  onChange: (value: string) => void;
  /** Current consultation context */
  context: ConsultationContext;
  /** Handler for context changes */
  onContextChange: (context: ConsultationContext) => void;
  /** Handler for analyze button click */
  onAnalyze: () => void;
  /** Handler for clear button click */
  onClear: () => void;
  /** Whether analysis is currently in progress */
  isLoading: boolean;
}


/**
 * Input validation constants
 */
const INPUT_CONSTRAINTS = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 10000,
  WARNING_THRESHOLD: 8000, // Show warning when approaching limit
};

/**
 * Consultation Input Component
 */
const ConsultationInput: React.FC<ConsultationInputProps> = ({
  value,
  onChange,
  context,
  onContextChange,
  onAnalyze,
  onClear,
  isLoading,
}) => {

  /**
   * Handle text area input
   */
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    
    // Enforce maximum length
    if (newValue.length <= INPUT_CONSTRAINTS.MAX_LENGTH) {
      onChange(newValue);
    }
  };

  /**
   * Get input validation state
   */
  const getValidationState = () => {
    const length = value.length;
    
    if (length < INPUT_CONSTRAINTS.MIN_LENGTH) {
      return {
        isValid: false,
        message: `Minimum ${INPUT_CONSTRAINTS.MIN_LENGTH} characters required`,
        type: 'error' as const,
      };
    }
    
    if (length > INPUT_CONSTRAINTS.WARNING_THRESHOLD) {
      return {
        isValid: true,
        message: `Approaching character limit (${length}/${INPUT_CONSTRAINTS.MAX_LENGTH})`,
        type: 'warning' as const,
      };
    }
    
    return {
      isValid: true,
      message: `${length}/${INPUT_CONSTRAINTS.MAX_LENGTH} characters`,
      type: 'success' as const,
    };
  };

  const validation = getValidationState();

  return (
    <div className="consultation-input">
      {/* Section Header */}
      <div className="input-header">
        <h2>Consultation Note Analysis</h2>
        <p className="input-description">
          Enter a consultation note and select the appropriate context to receive AI-powered MBS code recommendations.
        </p>
      </div>

      {/* Context Selection */}
      <ContextSelector
        value={context}
        onChange={onContextChange}
        disabled={isLoading}
      />

      {/* Text Input Area */}
      <div className="text-input-container">
        <label htmlFor="consultation-textarea" className="input-label">
          Consultation Note
        </label>
        
        <div className="textarea-wrapper">
          <textarea
            id="consultation-textarea"
            value={value}
            onChange={handleTextChange}
            placeholder="Enter consultation note here... (e.g., Patient presented with persistent cough lasting 3 weeks...)"
            className={`consultation-textarea ${validation.type}`}
            disabled={isLoading}
            rows={12}
            aria-describedby="char-count validation-message"
          />
          
          {/* Character Count */}
          <div 
            id="char-count"
            className={`character-count ${validation.type}`}
          >
            {validation.message}
          </div>
          
          {/* Validation Message */}
          {!validation.isValid && (
            <div 
              id="validation-message"
              className="validation-message error"
              role="alert"
            >
              {validation.message}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="input-actions">
        <div className="primary-actions">
          <button
            onClick={onAnalyze}
            disabled={!validation.isValid || isLoading || !value.trim()}
            className="analyze-button"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Analyzing...
              </>
            ) : (
              'Analyze Consultation'
            )}
          </button>
          
          <button
            onClick={onClear}
            disabled={isLoading || !value.trim()}
            className="clear-button"
          >
            Clear
          </button>
        </div>
        
        {/* Help Text */}
        <div className="help-text">
          <p>
            <strong>Tip:</strong> Include consultation duration, symptoms, examination findings, 
            and treatment decisions for more accurate MBS code recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationInput;