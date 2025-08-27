/**
 * Main Application Component
 * 
 * This is the root component that orchestrates the entire MBS Coding Assistant interface.
 * It manages the application state and coordinates between input and results components.
 * 
 * Features:
 * - Consultation note input and analysis
 * - MBS code recommendations display
 * - Loading states and error handling
 * - Demo mode with mock data
 */

import React, { useState } from 'react';
import ConsultationInput from './components/ConsultationInput/ConsultationInput';
import ResultsDisplay from './components/ResultsDisplay/ResultsDisplay';
import Header from './components/Header/Header';
import LoadingSpinner from './components/LoadingStates/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay/ErrorDisplay';
import { AnalysisResponse, AnalysisSuccessResponse, ConsultationContext, isSuccessResponse } from './types/api.types';
import { analyzeConsultation } from './services/apiService';
import './styles/App.css';

/**
 * Application state interface
 */
interface AppState {
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
}

/**
 * Main App Component
 */
const App: React.FC = () => {
  // Application state
  const [appState, setAppState] = useState<AppState>({
    consultationNote: '',
    context: 'general_practice',
    results: null,
    isLoading: false,
    error: null,
  });

  /**
   * Handle consultation note input changes
   */
  const handleConsultationChange = (note: string) => {
    setAppState(prev => ({
      ...prev,
      consultationNote: note,
      error: null, // Clear any previous errors
    }));
  };

  /**
   * Handle consultation context changes
   */
  const handleContextChange = (context: ConsultationContext) => {
    setAppState(prev => ({
      ...prev,
      context,
      error: null, // Clear any previous errors
    }));
  };

  /**
   * Handle consultation analysis submission
   */
  const handleAnalyzeConsultation = async () => {
    if (!appState.consultationNote.trim()) {
      setAppState(prev => ({
        ...prev,
        error: 'Please enter a consultation note before analyzing.',
      }));
      return;
    }

    // Set loading state
    setAppState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      results: null,
    }));

    try {
      // Call the API service
      const response: AnalysisResponse = await analyzeConsultation({
        consultation_note: appState.consultationNote,
        context: appState.context,
        options: {
          max_codes: 5,
          min_confidence: 0.6,
          include_reasoning: true,
        },
      });

      if (isSuccessResponse(response)) {
        // Success - update results
        setAppState(prev => ({
          ...prev,
          results: response,
          isLoading: false,
          error: null,
        }));
      } else if ('status' in response && response.status === 'error') {
        // Error response
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Analysis failed. Please try again.',
          results: null,
        }));
      } else {
        // Validation error response
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Validation error. Please check your input.',
          results: null,
        }));
      }
    } catch (error) {
      // Network or unexpected error
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred.',
        results: null,
      }));
    }
  };

  /**
   * Handle clearing all data
   */
  const handleClear = () => {
    setAppState(prev => ({
      ...prev,
      consultationNote: '',
      results: null,
      error: null,
    }));
  };


  return (
    <div className="app">
      {/* Application Header */}
      <Header />

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Input Section */}
          <div className="input-section">
            <ConsultationInput
              value={appState.consultationNote}
              onChange={handleConsultationChange}
              context={appState.context}
              onContextChange={handleContextChange}
              onAnalyze={handleAnalyzeConsultation}
              onClear={handleClear}
              isLoading={appState.isLoading}
            />
          </div>

          {/* Loading State */}
          {appState.isLoading && (
            <div className="loading-section">
              <LoadingSpinner 
                message="Analyzing consultation note..."
                subMessage="This may take 6-30 seconds"
              />
            </div>
          )}

          {/* Error Display */}
          {appState.error && (
            <div className="error-section">
              <ErrorDisplay 
                message={appState.error}
                onRetry={handleAnalyzeConsultation}
                canRetry={!!appState.consultationNote.trim()}
              />
            </div>
          )}

          {/* Results Section */}
          {appState.results && !appState.isLoading && (
            <div className="results-section">
              <ResultsDisplay 
                results={appState.results}
                consultationText={appState.consultationNote}
              />
            </div>
          )}

          {/* Empty State */}
          {!appState.results && !appState.isLoading && !appState.error && (
            <div className="empty-state">
              <div className="empty-state-content">
                <h3>Ready to Analyze</h3>
                <p>Enter a consultation note and select the appropriate context above, then click "Analyze" to get MBS code recommendations.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>
            MBS Coding Assistant • Built for Australian Healthcare Providers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;