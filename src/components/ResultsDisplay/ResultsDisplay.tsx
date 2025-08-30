/**
 * Results Display Component
 * 
 * Professional display of MBS code recommendations with detailed information.
 * Shows confidence scores, reasoning, and direct links to MBS Online.
 * 
 * Features:
 * - Sortable MBS code recommendation cards
 * - Confidence visualization with color coding
 * - Medical reasoning display
 * - Direct MBS Online integration
 * - Copy-to-clipboard functionality
 * - Processing metadata display
 * - Responsive card layout
 */

import React, { useState } from 'react';
import { AnalysisSuccessResponse, EvidenceSpan, CodeFeedback, CodeSuggestion, EnhancedCodeRecommendation, BulkOperationType } from '../../types/api.types';
import { useCodeSelection } from '../../hooks/useCodeSelection';
import { useEnhancedUX } from '../../hooks/useEnhancedUX';
import { useSelectionManagement } from '../../hooks/useSelectionManagement';
import EnhancedToolbar from '../EnhancedToolbar/EnhancedToolbar';
import SelectionPanel from '../SelectionPanel/SelectionPanel';
import MBSCodeCard from './MBSCodeCard';
import ProcessingMetadata from './ProcessingMetadata';
import HighlightedText from '../TextHighlighting/HighlightedText';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  /** Analysis results from the API */
  results: AnalysisSuccessResponse;
  /** Original consultation text for highlighting */
  consultationText: string;
  /** Handler for feedback submission */
  onFeedbackSubmit?: (feedback: CodeFeedback) => void;
  /** Handler for suggestion submission */
  onSuggestionSubmit?: (suggestion: CodeSuggestion) => void;
  /** Map of existing feedback by code */
  feedbackMap?: Map<string, CodeFeedback>;
}

/**
 * Sort options for recommendations
 */
type SortOption = 'confidence' | 'fee' | 'code';

/**
 * Results Display Component
 */
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  consultationText,
  onFeedbackSubmit,
  onSuggestionSubmit,
  feedbackMap
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('confidence');
  const [showMetadata, setShowMetadata] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Enhanced code selection functionality
  const enhancedRecommendations: EnhancedCodeRecommendation[] = results.recommendations.map(rec => ({
    ...rec,
    // Apply default schedule fee if incoming value is 0
    schedule_fee: rec.schedule_fee === 0 ? 68.45 : rec.schedule_fee,
    conflicts: [], // Will be populated by conflict detection in Phase 3
    compatibleWith: [], // Will be populated by compatibility checking
    mbsCategory: 'professional_attendances', // Default category
    timeRequirement: 0, // Default time requirement
    exclusionRules: []
  }));

  const {
    selectionState,
    toggleCodeSelection,
    selectionSummary,
    clearSelection,
    selectCode,
    deselectCode
  } = useCodeSelection(enhancedRecommendations, {
    maxCodes: 10,
    onSelectionChange: (selections) => {
      console.log('Selection changed:', selections);
    },
    onConflictDetected: (conflicts) => {
      console.log('Conflicts detected:', conflicts);
    }
  });

  // Enhanced UX functionality for toolbar
  const handleSelectionSetChange = (newSelection: Set<string>) => {
    const current = selectionState.selectedCodes;
    // Deselect codes not in the new selection
    Array.from(current)
      .filter(code => !newSelection.has(code))
      .forEach(code => deselectCode(code));
    // Select codes that are new
    Array.from(newSelection)
      .filter(code => !current.has(code))
      .forEach(code => {
        const rec = enhancedRecommendations.find(r => r.code === code);
        if (rec) {
          selectCode(code, rec);
        }
      });
  };

  const {
    bulkOperations,
    quickFilters,
    undoRedo
  } = useEnhancedUX(
    enhancedRecommendations,
    selectionState.selectedCodes,
    handleSelectionSetChange
  );

  // Selection management functionality for panel
  const {
    presets,
    optimizationSuggestions,
    selectionHistory,
    presetOperations,
    optimizationActions,
    selectionComparison
  } = useSelectionManagement(selectionState, enhancedRecommendations, {
    onPresetChange: (presetId, preset) => {
      console.log('Preset change:', presetId, preset);
    },
    onOptimizationApply: (suggestion) => {
      console.log('Optimization apply:', suggestion);
    }
  });

  /**
   * Get selection state for a specific code
   */
  const getSelectionState = (code: string): 'selected' | 'available' | 'compatible' | 'conflict' | 'blocked' => {
    const isSelected = selectionState.selectedCodes.has(code);
    if (isSelected) return 'selected';
    
    // For Phase 2, all unselected codes are available
    // Phase 3 will add conflict detection logic here
    return 'available';
  };

  /**
   * Handle code selection toggle
   */
  const handleToggleSelection = (code: string, recommendation: EnhancedCodeRecommendation) => {
    toggleCodeSelection(code, recommendation);
  };

  /**
   * Sort recommendations based on selected criteria (use filtered recommendations)
   */
  const sortedRecommendations = [...(quickFilters.filteredRecommendations || enhancedRecommendations)].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence; // Highest first
      case 'fee':
        return b.schedule_fee - a.schedule_fee; // Highest first
      case 'code':
        return a.code.localeCompare(b.code); // Alphabetical
      default:
        return b.confidence - a.confidence;
    }
  });

  /**
   * Get confidence level category for styling
   */
  const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  /**
   * Format processing time for display
   */
  const formatProcessingTime = (timeMs: number): string => {
    if (timeMs < 1000) return `${timeMs}ms`;
    const seconds = (timeMs / 1000).toFixed(1);
    return `${seconds}s`;
  };

  /**
   * Handle evidence span click from highlighted text
   */
  const handleEvidenceClick = (codeId: string, _evidenceSpan: EvidenceSpan) => {
    setSelectedCode(codeId);
  };

  /**
   * Handle MBS code card selection
   */
  const handleCodeCardClick = (codeId: string) => {
    setSelectedCode(selectedCode === codeId ? null : codeId);
  };

  return (
    <div className="results-display">
      {/* Enhanced Toolbar */}
      <EnhancedToolbar
        selectedCodes={Array.from(selectionState.selectedCodes)}
        recommendations={enhancedRecommendations}
        onBulkOperation={(operation: BulkOperationType, data?: string) => {
          switch (operation) {
            case 'select_all':
              bulkOperations.selectAll();
              break;
            case 'clear_all':
              bulkOperations.selectNone();
              break;
            case 'select_by_category':
              if (data) bulkOperations.selectByCategory(data as any);
              break;
            case 'select_compatible':
              bulkOperations.selectCompatibleWith(selectionState.selectedCodes);
              break;
            case 'invert_selection':
              bulkOperations.invertSelection(selectionState.selectedCodes);
              break;
            case 'select_by_fee_range':
              if (data) {
                const [minStr, maxStr] = data.split(',');
                const min = Number(minStr);
                const max = Number(maxStr);
                if (!Number.isNaN(min) && !Number.isNaN(max)) {
                  bulkOperations.selectByFeeRange(min, max);
                }
              }
              break;
          }
        }}
        onFilterChange={(filters) => {
          // Map toolbar filters into quick filter hook (legacy options)
          quickFilters.applyFilter({
            feeRange: { min: filters.minFee, max: filters.maxFee },
            minConfidence: filters.minConfidence,
          });
        }}
        onExport={(format) => {
          console.log('Export:', format);
        }}
        onUndo={() => undoRedo.undo()}
        onRedo={() => undoRedo.redo()}
        canUndo={undoRedo.canUndo}
        canRedo={undoRedo.canRedo}
        totalSelectedFee={selectionSummary.totalFee}
        conflictCount={Array.from(selectionState?.conflicts?.values() || []).reduce((sum, rules) => sum + (rules?.length || 0), 0)}
        isLoading={false}
      />

      {/* Main Content Layout */}
      <div className="results-content">
        {/* Selection Panel */}
        <div className="results-sidebar">
          <SelectionPanel
            selectionState={selectionState}
            presets={presets}
            optimizationSuggestions={optimizationSuggestions}
            selectionHistory={selectionHistory}
            onPresetSave={(preset) => presetOperations.save({
              name: preset.name,
              description: preset.description,
              selectedCodes: Array.from(selectionState.selectedCodes),
            })}
            onPresetLoad={presetOperations.load}
            onPresetDelete={presetOperations.delete}
            onOptimizationApply={optimizationActions.apply}
            onSelectionRevert={(historyId: string) => {
              console.log('Revert to history:', historyId);
            }}
            onComparisonStart={selectionComparison.start}
            isComparisonMode={selectionComparison.isActive}
            comparisonSelection={selectionComparison.comparisonState}
            isLoading={false}
          />
        </div>

        {/* Main Results Area */}
        <div className="results-main">
          {/* Results Header */}
          <div className="results-header">
            <div className="results-title">
              <h2>MBS Code Recommendations</h2>
              <p className="results-summary">
                Found {sortedRecommendations.length} of {results.recommendations.length} recommendation{results.recommendations.length !== 1 ? 's' : ''}
              </p>
            </div>

        {/* Sort and Filter Controls */}
        <div className="results-controls">
          <div className="sort-controls">
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="confidence">Confidence Score</option>
              <option value="fee">Schedule Fee</option>
              <option value="code">MBS Code</option>
            </select>
          </div>

          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="metadata-toggle"
            type="button"
          >
            {showMetadata ? 'Hide' : 'Show'} Processing Details
          </button>
        </div>
      </div>

      {/* Processing Summary */}
      <div className="processing-summary">
        <div className="summary-item">
          <span className="summary-label">Processing Time:</span>
          <span className="summary-value">{formatProcessingTime(results.metadata.processing_time_ms)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Model Used:</span>
          <span className="summary-value">{results.metadata.model_used || 'N/A'}</span>
        </div>
        {results.metadata.categorization && (
          <div className="summary-item">
            <span className="summary-label">Category:</span>
            <span className="summary-value">
              {results.metadata.categorization.category_name} ({results.metadata.categorization.context})
            </span>
          </div>
        )}
      </div>

      {/* Highlighted Consultation Text */}
      <div className="highlighted-text-section">
        <h3>Consultation Analysis with Evidence Highlighting</h3>
        <p className="section-description">
          The sections highlighted below show the parts of your consultation note that 
          led to each MBS code recommendation. Click on highlighted text or MBS cards 
          to see connections.
        </p>
        <HighlightedText
          text={consultationText}
          recommendations={sortedRecommendations}
          selectedCode={selectedCode || undefined}
          onEvidenceClick={handleEvidenceClick}
        />
      </div>

      {/* Selection Summary */}
      {selectionState.selectedCodes.size > 0 && (
        <div className="selection-summary">
          <h3>Selected MBS Codes ({selectionState.selectedCodes.size})</h3>
          <div className="selection-details">
            <div className="selected-codes">
              <span className="codes-label">Codes:</span>
              <span className="codes-list">
                {Array.from(selectionState.selectedCodes).join(', ')}
              </span>
            </div>
            <div className="selection-total">
              <span className="total-label">Total Schedule Fee:</span>
              <span className="total-amount">
                ${selectionSummary.totalFee.toFixed(2)}
              </span>
            </div>
            <button
              onClick={clearSelection}
              className="clear-selections-button"
              type="button"
            >
              Clear All Selections
            </button>
          </div>
          {selectionSummary.warnings.length > 0 && (
            <div className="selection-conflicts">
              <h4>⚠️ Selection Warnings</h4>
              {selectionSummary.warnings.map((warning, index) => (
                <div key={index} className="conflict-alert">
                  <span className="conflict-message">{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confidence Distribution */}
      <div className="confidence-overview">
        <h3>Confidence Distribution</h3>
        <div className="confidence-bars">
          {['high', 'medium', 'low'].map((level) => {
            const count = sortedRecommendations.filter(rec => 
              getConfidenceLevel(rec.confidence) === level
            ).length;
            const percentage = (count / sortedRecommendations.length) * 100;
            
            return (
              <div key={level} className={`confidence-bar ${level}`}>
                <div className="bar-label">
                  <span className="level-name">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  <span className="level-count">({count})</span>
                </div>
                {/* Always render bar-track to ensure consistent structure */}
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${Math.max(0, percentage)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

          {/* MBS Code Cards */}
          <div className="recommendations-grid">
            {sortedRecommendations.map((recommendation, index) => (
              <MBSCodeCard
                key={`${recommendation.code}-${index}`}
                recommendation={recommendation}
                rank={index + 1}
                confidenceLevel={getConfidenceLevel(recommendation.confidence)}
                isSelected={selectionState.selectedCodes.has(recommendation.code)}
                onCardClick={() => handleCodeCardClick(recommendation.code)}
                onFeedbackSubmit={onFeedbackSubmit}
                onSuggestionSubmit={onSuggestionSubmit}
                existingFeedback={feedbackMap?.get(recommendation.code)}
                // Enhanced selection functionality
                selectionState={getSelectionState(recommendation.code)}
                onToggleSelection={handleToggleSelection}
                conflicts={recommendation.conflicts}
                compatibleCodes={recommendation.compatibleWith}
                suggestions={[]} // Will be populated in Phase 3
              />
            ))}
          </div>

          {/* Processing Metadata */}
          {showMetadata && (
            <ProcessingMetadata 
              metadata={results.metadata}
            />
          )}

          {/* Results Footer */}
          <div className="results-footer">
            <div className="disclaimer">
              <h4>Important Notice</h4>
              <p>
                These are AI-generated recommendations for reference only. 
                Always verify MBS codes against official guidelines and consult 
                with qualified medical coding professionals for billing decisions.
              </p>
            </div>
            
            <div className="help-links">
              <a 
                href="https://www9.health.gov.au/mbs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="help-link"
              >
                MBS Online Official Site
              </a>
              <a 
                href="https://www9.health.gov.au/mbs/search.cfm" 
                target="_blank" 
                rel="noopener noreferrer"
                className="help-link"
              >
                MBS Code Search
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;