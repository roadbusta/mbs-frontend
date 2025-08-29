/**
 * Context Selector Component
 * 
 * Provides a dropdown interface for selecting consultation context.
 * The selected context helps the AI backend provide more accurate MBS code recommendations.
 * 
 * Features:
 * - Clean dropdown interface with context options
 * - Clear labels and descriptions for each context type
 * - Responsive design that matches the application theme
 * - Accessibility support with proper ARIA attributes
 */

import React from 'react';
import { ConsultationContext } from '../../types/api.types';
import './ContextSelector.css';

interface ContextSelectorProps {
  /** Currently selected consultation context */
  value: ConsultationContext;
  /** Handler for context selection changes */
  onChange: (context: ConsultationContext) => void;
  /** Whether the selector is disabled (e.g., during loading) */
  disabled?: boolean;
}

/**
 * Available consultation context options with descriptive labels
 */
const CONTEXT_OPTIONS: Array<{
  value: ConsultationContext;
  label: string;
  description: string;
}> = [
  {
    value: 'general_practice',
    label: 'General Practice',
    description: 'Standard GP consultation (Level A, B, C, D consultations)'
  },
  {
    value: 'emergency_department',
    label: 'Emergency Department',
    description: 'Hospital emergency department consultation'
  },
  {
    value: 'specialist',
    label: 'Specialist Consultation',
    description: 'Specialist referral or consultation (cardiology, endocrinology, etc.)'
  },
  {
    value: 'mental_health',
    label: 'Mental Health',
    description: 'Mental health care plan or psychological consultation'
  },
  {
    value: 'telehealth',
    label: 'Telehealth',
    description: 'Video or phone consultation'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other consultation type not listed above'
  }
];

/**
 * Context Selector Component
 */
const ContextSelector: React.FC<ContextSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  /**
   * Handle dropdown selection change
   */
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as ConsultationContext);
  };

  /**
   * Get the description for the currently selected context
   */
  const getSelectedDescription = (): string => {
    const selected = CONTEXT_OPTIONS.find(option => option.value === value);
    return selected?.description || '';
  };

  return (
    <div className="context-selector">
      <label htmlFor="context-select" className="input-label">
        Consultation Context
      </label>
      <div className="context-input-group">
        <select
          id="context-select"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="context-select"
          aria-describedby="context-description"
        >
          {CONTEXT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="context-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path 
              d="M5 7L10 12L15 7" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <p id="context-description" className="context-description">
        {getSelectedDescription()}
      </p>
    </div>
  );
};

export default ContextSelector;