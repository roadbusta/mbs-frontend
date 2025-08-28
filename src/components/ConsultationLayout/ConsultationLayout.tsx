/**
 * Consultation Layout Component
 * 
 * Modern side-by-side layout for consultation input and analysis.
 * Provides improved user experience with better visual hierarchy and workflow.
 * 
 * Features:
 * - Side-by-side layout (input left, analysis right)
 * - Responsive design that stacks on mobile
 * - Real-time status feedback
 * - Professional medical-grade UI
 */

import React from 'react';
import ConsultationInput from '../ConsultationInput/ConsultationInput';
import AnalysisCard from '../AnalysisCard/AnalysisCard';
import { ConsultationContext } from '../../types/api.types';
import './ConsultationLayout.css';

interface ConsultationLayoutProps {
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
 * Input validation constants (matching ConsultationInput)
 */
const INPUT_CONSTRAINTS = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 10000,
};

/**
 * Consultation Layout Component
 */
const ConsultationLayout: React.FC<ConsultationLayoutProps> = ({
  value,
  onChange,
  context,
  onContextChange,
  onAnalyze,
  onClear,
  isLoading,
}) => {
  // Calculate analysis readiness
  const characterCount = value.length;
  const hasMinimumChars = characterCount >= INPUT_CONSTRAINTS.MIN_LENGTH;
  const contextSelected = Boolean(context);
  const hasContent = value.trim().length > 0;
  const isReady = hasMinimumChars && contextSelected && !isLoading;

  return (
    <div className="consultation-layout">
      {/* Left Panel - Input Section */}
      <div className="input-panel">
        <ConsultationInput
          value={value}
          onChange={onChange}
          context={context}
          onContextChange={onContextChange}
          isLoading={isLoading}
          showActions={false} // Actions moved to AnalysisCard
        />
      </div>

      {/* Right Panel - Analysis Section */}
      <div className="analysis-panel">
        <AnalysisCard
          isReady={isReady}
          characterCount={characterCount}
          minCharacters={INPUT_CONSTRAINTS.MIN_LENGTH}
          maxCharacters={INPUT_CONSTRAINTS.MAX_LENGTH}
          contextSelected={contextSelected}
          isAnalyzing={isLoading}
          hasContent={hasContent}
          onAnalyze={onAnalyze}
          onClear={onClear}
        />
      </div>
    </div>
  );
};

export default ConsultationLayout;