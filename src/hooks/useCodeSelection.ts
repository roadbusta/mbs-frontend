/**
 * Custom hook for managing MBS code selection with conflict detection
 * 
 * Provides state management and validation for selecting multiple MBS codes
 * while preventing conflicts through intelligent validation.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  SelectionState,
  EnhancedCodeRecommendation,
  ConflictValidation,
  SelectionSummary,
  SelectionValidation,
  detectConflicts,
  calculateSelectionSummary,
  validateCodeSelection
} from '../types/api.types';

export interface UseCodeSelectionOptions {
  /** Initial selected codes */
  initialSelection?: Set<string>;
  /** Maximum number of codes that can be selected */
  maxCodes?: number;
  /** Callback when selection changes */
  onSelectionChange?: (selection: SelectionState) => void;
  /** Callback when conflicts are detected */
  onConflictDetected?: (validation: ConflictValidation) => void;
}

export interface UseCodeSelectionReturn {
  /** Current selection state */
  selectionState: SelectionState;
  /** Summary of current selection */
  selectionSummary: SelectionSummary;
  /** Overall validation of selection */
  selectionValidation: SelectionValidation;
  /** Toggle code selection */
  toggleCodeSelection: (code: string, recommendation: EnhancedCodeRecommendation) => ConflictValidation;
  /** Select a code (if possible) */
  selectCode: (code: string, recommendation: EnhancedCodeRecommendation) => ConflictValidation;
  /** Deselect a code */
  deselectCode: (code: string) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if a code can be selected */
  canSelectCode: (code: string, recommendations: EnhancedCodeRecommendation[]) => ConflictValidation;
  /** Get selection state for a specific code */
  getCodeSelectionState: (code: string, recommendations: EnhancedCodeRecommendation[]) => 'selected' | 'available' | 'compatible' | 'conflict' | 'blocked';
  /** Check if code is selected */
  isCodeSelected: (code: string) => boolean;
}

/**
 * Custom hook for MBS code selection management
 */
export function useCodeSelection(
  allRecommendations: EnhancedCodeRecommendation[],
  options: UseCodeSelectionOptions = {}
): UseCodeSelectionReturn {
  const {
    initialSelection = new Set(),
    maxCodes = 10,
    onSelectionChange,
    onConflictDetected
  } = options;

  // Initialize selection state
  const [selectionState, setSelectionState] = useState<SelectionState>(() => ({
    selectedCodes: new Set(initialSelection),
    conflicts: new Map(),
    totalFee: 0,
    warnings: []
  }));

  // Calculate selection summary
  const selectionSummary = useMemo((): SelectionSummary => {
    return calculateSelectionSummary(selectionState.selectedCodes, allRecommendations);
  }, [selectionState.selectedCodes, allRecommendations]);

  // Validate entire selection
  const selectionValidation = useMemo((): SelectionValidation => {
    return validateCodeSelection(selectionState, allRecommendations);
  }, [selectionState, allRecommendations]);

  // Update selection state with recalculated values
  const updateSelectionState = useCallback((newSelectedCodes: Set<string>) => {
    const summary = calculateSelectionSummary(newSelectedCodes, allRecommendations);
    const conflicts = new Map<string, any>();
    
    // Calculate conflicts for each selected code
    for (const code of newSelectedCodes) {
      const otherCodes = new Set(newSelectedCodes);
      otherCodes.delete(code);
      
      if (otherCodes.size > 0) {
        const validation = detectConflicts(otherCodes, code, allRecommendations);
        if (validation.conflicts.length > 0) {
          conflicts.set(code, validation.conflicts);
        }
      }
    }

    const newState: SelectionState = {
      selectedCodes: newSelectedCodes,
      conflicts,
      totalFee: summary.totalFee,
      warnings: summary.warnings
    };

    setSelectionState(newState);
    onSelectionChange?.(newState);
  }, [allRecommendations, onSelectionChange]);

  // Toggle code selection
  const toggleCodeSelection = useCallback((
    code: string,
    recommendation: EnhancedCodeRecommendation
  ): ConflictValidation => {
    if (selectionState.selectedCodes.has(code)) {
      // Deselect the code
      const newSelection = new Set(selectionState.selectedCodes);
      newSelection.delete(code);
      updateSelectionState(newSelection);
      
      return {
        canSelect: true,
        conflicts: [],
        warnings: [],
        suggestions: []
      };
    } else {
      // Try to select the code
      return selectCode(code, recommendation);
    }
  }, [selectionState.selectedCodes]);

  // Select a code
  const selectCode = useCallback((
    code: string,
    recommendation: EnhancedCodeRecommendation
  ): ConflictValidation => {
    // Check if we've reached the maximum
    if (selectionState.selectedCodes.size >= maxCodes) {
      const validation: ConflictValidation = {
        canSelect: false,
        conflicts: [],
        warnings: [`Maximum ${maxCodes} codes can be selected`],
        suggestions: ['Deselect other codes to select this one']
      };
      onConflictDetected?.(validation);
      return validation;
    }

    // Check for conflicts
    const validation = detectConflicts(selectionState.selectedCodes, code, allRecommendations);
    
    if (validation.canSelect) {
      const newSelection = new Set(selectionState.selectedCodes);
      newSelection.add(code);
      updateSelectionState(newSelection);
    }

    if (validation.conflicts.length > 0 || validation.warnings.length > 0) {
      onConflictDetected?.(validation);
    }

    return validation;
  }, [selectionState.selectedCodes, maxCodes, allRecommendations, updateSelectionState, onConflictDetected]);

  // Deselect a code
  const deselectCode = useCallback((code: string) => {
    if (selectionState.selectedCodes.has(code)) {
      const newSelection = new Set(selectionState.selectedCodes);
      newSelection.delete(code);
      updateSelectionState(newSelection);
    }
  }, [selectionState.selectedCodes, updateSelectionState]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    updateSelectionState(new Set());
  }, [updateSelectionState]);

  // Check if a code can be selected
  const canSelectCode = useCallback((
    code: string,
    recommendations: EnhancedCodeRecommendation[]
  ): ConflictValidation => {
    if (selectionState.selectedCodes.has(code)) {
      return {
        canSelect: true,
        conflicts: [],
        warnings: ['Code is already selected'],
        suggestions: []
      };
    }

    if (selectionState.selectedCodes.size >= maxCodes) {
      return {
        canSelect: false,
        conflicts: [],
        warnings: [`Maximum ${maxCodes} codes can be selected`],
        suggestions: ['Deselect other codes first']
      };
    }

    return detectConflicts(selectionState.selectedCodes, code, recommendations);
  }, [selectionState.selectedCodes, maxCodes]);

  // Get selection state for a specific code
  const getCodeSelectionState = useCallback((
    code: string,
    recommendations: EnhancedCodeRecommendation[]
  ): 'selected' | 'available' | 'compatible' | 'conflict' | 'blocked' => {
    if (selectionState.selectedCodes.has(code)) {
      return 'selected';
    }

    if (selectionState.selectedCodes.size === 0) {
      return 'available';
    }

    const validation = canSelectCode(code, recommendations);
    
    if (!validation.canSelect && validation.conflicts.some(c => c.severity === 'blocking')) {
      return 'blocked';
    }

    if (validation.warnings.length > 0 || validation.conflicts.some(c => c.severity === 'warning')) {
      return 'conflict';
    }

    if (validation.canSelect) {
      return 'compatible';
    }

    return 'available';
  }, [selectionState.selectedCodes, canSelectCode]);

  // Check if code is selected
  const isCodeSelected = useCallback((code: string): boolean => {
    return selectionState.selectedCodes.has(code);
  }, [selectionState.selectedCodes]);

  return {
    selectionState,
    selectionSummary,
    selectionValidation,
    toggleCodeSelection,
    selectCode,
    deselectCode,
    clearSelection,
    canSelectCode,
    getCodeSelectionState,
    isCodeSelected
  };
}