/**
 * Consultation Analysis Page
 * 
 * This page component wraps the existing consultation analysis functionality
 * to work within the new dashboard layout system. It maintains all existing
 * features while integrating with the new navigation structure.
 * 
 * Features:
 * - All existing consultation analysis functionality
 * - Integration with dashboard layout
 * - Maintains state management and API integration
 * - Responsive design within dashboard context
 */

import React, { useState } from 'react';
import ConsultationLayout from '../components/ConsultationLayout/ConsultationLayout';
import ResultsDisplay from '../components/ResultsDisplay/ResultsDisplay';
import LoadingSpinner from '../components/LoadingStates/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
import { AnalysisResponse, AnalysisSuccessResponse, ConsultationContext, CodeFeedback, CodeSuggestion, isSuccessResponse } from '../types/api.types';
import { analyseConsultation } from '../services/apiService';
import auditService from '../services/auditService';
import './ConsultationAnalysis.css';

/**
 * Consultation Analysis state interface
 */
interface ConsultationState {
  /** Current consultation note text */
  consultationNote: string;
  /** Selected consultation context */
  context: ConsultationContext;
  /** Analysis results from API */
  results: AnalysisSuccessResponse | null;
  /** Loading state during API calls */
  isLoading: boolean;
  /** Error message if analysis fails */
  error: string | null;
  /** User feedback on code recommendations */
  feedback: Map<string, CodeFeedback>;
  /** User suggestions for alternative codes */
  suggestions: CodeSuggestion[];
}

const ConsultationAnalysis: React.FC = () => {
  // Page state
  const [state, setState] = useState<ConsultationState>({
    consultationNote: '',
    context: 'general_practice',
    results: null,
    isLoading: false,
    error: null,
    feedback: new Map(),
    suggestions: [],
  });

  /**
   * Handle consultation note input changes
   */
  const handleConsultationChange = (note: string) => {
    setState(prev => ({
      ...prev,
      consultationNote: note,
      error: null, // Clear any previous errors
    }));
  };

  /**
   * Handle consultation context changes
   */
  const handleContextChange = (context: ConsultationContext) => {
    setState(prev => ({
      ...prev,
      context,
      error: null, // Clear any previous errors
    }));
  };

  /**
   * Handle consultation analysis submission
   */
  const handleAnalyzeConsultation = async () => {
    if (!state.consultationNote.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a consultation note before analysing.',
      }));
      return;
    }

    // Log analysis start
    auditService.logAnalysis(
      'start', 
      state.consultationNote.length, 
      state.context
    );

    // Set loading state
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      results: null,
    }));

    try {
      const startTime = Date.now();
      
      // Call the API service
      const response: AnalysisResponse = await analyseConsultation({
        consultation_note: state.consultationNote,
        context: state.context,
        options: {
          max_codes: 5,
          min_confidence: 0.6,
          include_reasoning: true,
        },
      });

      const processingTime = Date.now() - startTime;

      if (isSuccessResponse(response)) {
        // Success - update results
        setState(prev => ({
          ...prev,
          results: response,
          isLoading: false,
          error: null,
        }));

        // Log successful analysis
        auditService.logAnalysis(
          'complete',
          state.consultationNote.length,
          state.context,
          processingTime,
          response.recommendations.length
        );

      } else if ('status' in response && response.status === 'error') {
        // Error response
        const errorMessage = response.message || 'Analysis failed. Please try again.';
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          results: null,
        }));

        // Log analysis error
        auditService.logAnalysis(
          'error',
          state.consultationNote.length,
          state.context,
          processingTime,
          undefined,
          { message: errorMessage }
        );

      } else {
        // Validation error response
        const errorMessage = 'Validation error. Please check your input.';
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          results: null,
        }));

        // Log validation error
        auditService.logAnalysis(
          'error',
          state.consultationNote.length,
          state.context,
          processingTime,
          undefined,
          { message: errorMessage }
        );
      }
    } catch (error) {
      // Network or unexpected error
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        results: null,
      }));

      // Log network error
      auditService.logAnalysis(
        'error',
        state.consultationNote.length,
        state.context,
        undefined,
        undefined,
        { message: errorMessage }
      );
    }
  };

  /**
   * Handle clearing all data
   */
  const handleClear = () => {
    setState(prev => ({
      ...prev,
      consultationNote: '',
      results: null,
      error: null,
      feedback: new Map(),
      suggestions: [],
    }));

    // Log clear action
    auditService.logAction('bulk_clear_all', 'Cleared consultation analysis');
  };

  /**
   * Handle feedback submission for MBS code recommendations
   */
  const handleFeedbackSubmit = (feedback: CodeFeedback) => {
    setState(prev => ({
      ...prev,
      feedback: new Map(prev.feedback).set(feedback.code, feedback)
    }));
    
    console.log('Feedback submitted:', feedback);
    
    // Log feedback action
    auditService.logAction(
      'code_select', // Using existing action type for feedback
      `Provided ${feedback.rating} feedback for code ${feedback.code}`,
      { code: feedback.code, feedback: feedback.rating }
    );
  };

  /**
   * Handle code suggestion submission
   */
  const handleSuggestionSubmit = (suggestion: CodeSuggestion) => {
    setState(prev => ({
      ...prev,
      suggestions: [...prev.suggestions, suggestion]
    }));
    
    console.log('Suggestion submitted:', suggestion);
    
    // Log suggestion action
    auditService.logAction(
      'preset_save', // Using existing action type for suggestions
      `Suggested alternative code ${suggestion.suggested_code}`,
      { 
        code: suggestion.replace_code,
        suggestedCode: suggestion.suggested_code,
        rationale: suggestion.rationale
      }
    );
    
    // Show success message
    alert(`Thank you for your suggestion! Code ${suggestion.suggested_code} has been noted for review.`);
  };

  return (
    <div className="consultation-analysis-page">
      {/* Input Section */}
      <div className="input-section">
        <ConsultationLayout
          value={state.consultationNote}
          onChange={handleConsultationChange}
          context={state.context}
          onContextChange={handleContextChange}
          onAnalyze={handleAnalyzeConsultation}
          onClear={handleClear}
          isLoading={state.isLoading}
        />
      </div>

      {/* Loading State */}
      {state.isLoading && (
        <div className="loading-section">
          <LoadingSpinner 
            message="Analysing consultation note..."
            subMessage="This may take 6-30 seconds"
          />
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="error-section">
          <ErrorDisplay 
            message={state.error}
            onRetry={handleAnalyzeConsultation}
            canRetry={!!state.consultationNote.trim()}
          />
        </div>
      )}

      {/* Results Section */}
      {state.results && !state.isLoading && (
        <div className="results-section">
          <ResultsDisplay 
            results={state.results}
            consultationText={state.consultationNote}
            onFeedbackSubmit={handleFeedbackSubmit}
            onSuggestionSubmit={handleSuggestionSubmit}
            feedbackMap={state.feedback}
          />
        </div>
      )}
    </div>
  );
};

export default ConsultationAnalysis;