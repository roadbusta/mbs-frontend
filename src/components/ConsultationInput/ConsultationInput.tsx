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
 * - Clear and analyse actions
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
  /** Whether analysis is currently in progress */
  isLoading: boolean;
  /** Whether to show action buttons (for backward compatibility) */
  showActions?: boolean;
  /** Handler for analyse button click (optional for layout compatibility) */
  onAnalyze?: () => void;
  /** Handler for clear button click (optional for layout compatibility) */
  onClear?: () => void;
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
  isLoading,
  showActions = true,
  onAnalyze,
  onClear,
}) => {
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false);

  /**
   * Handle text area input
   */
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    
    // Mark that user has started interacting
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    
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
    
    // Don't show validation errors until user has interacted
    if (!hasUserInteracted) {
      return {
        isValid: true,
        characterMessage: `${length}/${INPUT_CONSTRAINTS.MAX_LENGTH} characters`,
        errorMessage: null,
        type: 'neutral' as const,
        showError: false,
      };
    }
    
    if (length < INPUT_CONSTRAINTS.MIN_LENGTH) {
      return {
        isValid: false,
        characterMessage: `${length}/${INPUT_CONSTRAINTS.MAX_LENGTH} characters`,
        errorMessage: `Minimum ${INPUT_CONSTRAINTS.MIN_LENGTH} characters required`,
        type: 'error' as const,
        showError: true,
      };
    }
    
    if (length > INPUT_CONSTRAINTS.WARNING_THRESHOLD) {
      return {
        isValid: true,
        characterMessage: `Approaching character limit (${length}/${INPUT_CONSTRAINTS.MAX_LENGTH})`,
        errorMessage: null,
        type: 'warning' as const,
        showError: false,
      };
    }
    
    return {
      isValid: true,
      characterMessage: `${length}/${INPUT_CONSTRAINTS.MAX_LENGTH} characters`,
      errorMessage: null,
      type: 'success' as const,
      showError: false,
    };
  };

  const validation = getValidationState();

  return (
    <div className="consultation-input h-full flex flex-col">
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
            className={`consultation-textarea ${validation.showError ? validation.type : 'neutral'}`}
            disabled={isLoading}
            rows={12}
            aria-describedby="char-count validation-message"
          />
          
          {/* Character Count */}
          <div 
            id="char-count"
            className={`character-count ${validation.showError ? validation.type : 'neutral'}`}
          >
            {validation.characterMessage}
          </div>
          
          {/* Validation Message */}
          {validation.showError && !validation.isValid && validation.errorMessage && (
            <div 
              id="validation-message"
              className="validation-message error"
              role="alert"
            >
              {validation.errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (optional for backward compatibility) */}
      {showActions && onAnalyze && onClear && (
        <div className="input-actions">
          <div className="primary-actions">
            <button
              onClick={onAnalyze}
              disabled={!validation.isValid || isLoading || !value.trim()}
              className="analyse-button"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analysing...
                </>
              ) : (
                'Analyse Consultation'
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
      )}
    </div>
  );
};

export default ConsultationInput;