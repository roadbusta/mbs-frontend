/**
 * Bulk Selection Controls Component
 * 
 * Provides bulk selection functionality for Phase 3 enhanced analysis.
 * Allows users to select/deselect multiple code recommendations at once.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { EnhancedCodeRecommendation } from '../../../types/enhancedAnalysis.types';
import './BulkSelectionControls.css';

interface BulkSelectionControlsProps {
  /** Array of code recommendations */
  recommendations: EnhancedCodeRecommendation[];
  /** Currently selected code IDs */
  selectedCodes: string[];
  /** Handler for bulk selection */
  onBulkSelect: (codes: string[]) => void;
  /** Handler for bulk deselection */
  onBulkDeselect: (codes: string[]) => void;
  /** Additional data attributes for testing */
  'data-testid'?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Bulk Selection Controls Component
 */
const BulkSelectionControls: React.FC<BulkSelectionControlsProps> = memo(({
  recommendations,
  selectedCodes,
  onBulkSelect,
  onBulkDeselect,
  'data-testid': testId,
  className = ''
}) => {
  // Get available codes (not blocked or in conflict)
  const availableCodes = useMemo(() => {
    return recommendations
      .filter(rec => rec.selectionState === 'available' || rec.selectionState === 'compatible')
      .map(rec => rec.code);
  }, [recommendations]);

  // Get high confidence codes (confidence >= 0.8)
  const highConfidenceCodes = useMemo(() => {
    return recommendations
      .filter(rec => 
        (rec.selectionState === 'available' || rec.selectionState === 'compatible') && 
        rec.confidence >= 0.8
      )
      .map(rec => rec.code);
  }, [recommendations]);

  // Get medium confidence codes (confidence 0.6-0.79)
  const mediumConfidenceCodes = useMemo(() => {
    return recommendations
      .filter(rec => 
        (rec.selectionState === 'available' || rec.selectionState === 'compatible') && 
        rec.confidence >= 0.6 && rec.confidence < 0.8
      )
      .map(rec => rec.code);
  }, [recommendations]);

  // Calculate selection status
  const selectionStatus = useMemo(() => {
    const total = availableCodes.length;
    const selected = selectedCodes.filter(code => availableCodes.includes(code)).length;
    
    if (selected === 0) return 'None selected';
    if (selected === total) return 'All selected';
    return `${selected} of ${total} selected`;
  }, [availableCodes, selectedCodes]);

  // Check if all codes are selected
  const allSelected = useMemo(() => {
    return availableCodes.length > 0 && availableCodes.every(code => selectedCodes.includes(code));
  }, [availableCodes, selectedCodes]);

  // Check if no codes are selected
  const noneSelected = useMemo(() => {
    return selectedCodes.length === 0;
  }, [selectedCodes]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    onBulkSelect(availableCodes);
  }, [onBulkSelect, availableCodes]);

  // Handle deselect all
  const handleDeselectAll = useCallback(() => {
    onBulkDeselect(selectedCodes);
  }, [onBulkDeselect, selectedCodes]);

  // Handle high confidence selection
  const handleSelectHighConfidence = useCallback(() => {
    onBulkSelect(highConfidenceCodes);
  }, [onBulkSelect, highConfidenceCodes]);

  // Handle medium confidence selection
  const handleSelectMediumConfidence = useCallback(() => {
    onBulkSelect(mediumConfidenceCodes);
  }, [onBulkSelect, mediumConfidenceCodes]);

  return (
    <div 
      className={`bulk-selection-controls ${className}`.trim()}
      data-testid={testId}
      role="toolbar"
      aria-label="Bulk selection controls"
    >
      {/* Selection Status */}
      <div className="bulk-selection-controls__status">
        <div className="selection-summary">
          <span className="recommendations-count">
            {recommendations.length} recommendations
          </span>
          <span className="selection-status">
            {selectionStatus}
          </span>
        </div>
      </div>

      {/* Basic Selection Controls */}
      <div className="bulk-selection-controls__basic">
        <button
          className="bulk-button bulk-button--select"
          onClick={handleSelectAll}
          disabled={allSelected}
          aria-label={`Select all ${availableCodes.length} available recommendations`}
        >
          Select All
        </button>
        
        <button
          className="bulk-button bulk-button--deselect"
          onClick={handleDeselectAll}
          disabled={noneSelected}
          aria-label={`Deselect all ${selectedCodes.length} selected recommendations`}
        >
          Deselect All
        </button>
      </div>

      {/* Confidence-based Selection */}
      <div className="bulk-selection-controls__confidence">
        <div className="confidence-group">
          <button
            className="confidence-button confidence-button--high"
            onClick={handleSelectHighConfidence}
            disabled={highConfidenceCodes.length === 0}
            aria-label={`Select ${highConfidenceCodes.length} high confidence recommendations`}
          >
            High Confidence ({highConfidenceCodes.length})
          </button>
          
          <button
            className="confidence-button confidence-button--medium"
            onClick={handleSelectMediumConfidence}
            disabled={mediumConfidenceCodes.length === 0}
            aria-label={`Select ${mediumConfidenceCodes.length} medium confidence recommendations`}
          >
            Medium Confidence ({mediumConfidenceCodes.length})
          </button>
        </div>
      </div>
    </div>
  );
});

BulkSelectionControls.displayName = 'BulkSelectionControls';

export default BulkSelectionControls;