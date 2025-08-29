/**
 * Enhanced UX Hooks - Phase 4 Implementation
 * 
 * Provides bulk operations, quick filters, undo/redo, and keyboard shortcuts
 * for improved user experience with MBS code selection
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  QuickFilterOptions,
  EnhancedCodeRecommendation,
  MBSCategory,
  SelectionHistoryEntry
} from '../types/api.types';

// ============================================================================
// Bulk Operations Hook
// ============================================================================

export interface UseBulkOperationsReturn {
  selectAll: () => void;
  selectNone: () => void;
  selectByCategory: (category: MBSCategory) => void;
  selectByFeeRange: (minFee: number, maxFee: number) => void;
  selectCompatibleWith: (currentSelection: Set<string>) => void;
  invertSelection: (currentSelection: Set<string>) => void;
}

/**
 * Hook for bulk selection operations
 */
export function useBulkOperations(
  recommendations: EnhancedCodeRecommendation[],
  onSelectionChange?: (selection: Set<string>) => void
): UseBulkOperationsReturn {
  
  const selectAll = useCallback(() => {
    const allCodes = new Set(recommendations.map(rec => rec.code));
    onSelectionChange?.(allCodes);
  }, [recommendations, onSelectionChange]);

  const selectNone = useCallback(() => {
    onSelectionChange?.(new Set());
  }, [onSelectionChange]);

  const selectByCategory = useCallback((category: MBSCategory) => {
    const categoryCodes = new Set(
      recommendations
        .filter(rec => rec.mbsCategory === category)
        .map(rec => rec.code)
    );
    onSelectionChange?.(categoryCodes);
  }, [recommendations, onSelectionChange]);

  const selectByFeeRange = useCallback((minFee: number, maxFee: number) => {
    const codesInRange = new Set(
      recommendations
        .filter(rec => rec.schedule_fee >= minFee && rec.schedule_fee <= maxFee)
        .map(rec => rec.code)
    );
    onSelectionChange?.(codesInRange);
  }, [recommendations, onSelectionChange]);

  const selectCompatibleWith = useCallback((currentSelection: Set<string>) => {
    const compatibleCodes = new Set<string>();
    
    // Add all currently selected codes
    currentSelection.forEach(code => compatibleCodes.add(code));
    
    // Find codes compatible with all currently selected codes
    recommendations.forEach(rec => {
      if (currentSelection.has(rec.code)) return; // Skip already selected
      
      const isCompatibleWithAll = Array.from(currentSelection).every(selectedCode => {
        const selectedRec = recommendations.find(r => r.code === selectedCode);
        return selectedRec?.compatibleWith.includes(rec.code) ?? false;
      });
      
      if (isCompatibleWithAll) {
        compatibleCodes.add(rec.code);
      }
    });
    
    onSelectionChange?.(compatibleCodes);
  }, [recommendations, onSelectionChange]);

  const invertSelection = useCallback((currentSelection: Set<string>) => {
    const allCodes = recommendations.map(rec => rec.code);
    const inverted = new Set(
      allCodes.filter(code => !currentSelection.has(code))
    );
    onSelectionChange?.(inverted);
  }, [recommendations, onSelectionChange]);

  return {
    selectAll,
    selectNone,
    selectByCategory,
    selectByFeeRange,
    selectCompatibleWith,
    invertSelection
  };
}

// ============================================================================
// Quick Filters Hook
// ============================================================================

export interface UseQuickFiltersReturn {
  filteredRecommendations: EnhancedCodeRecommendation[];
  activeFilters: Partial<QuickFilterOptions>;
  applyFilter: (filter: Partial<QuickFilterOptions>) => void;
  clearFilters: () => void;
  clearFilter: (filterKey: keyof QuickFilterOptions) => void;
}

/**
 * Hook for quick filtering of recommendations
 */
export function useQuickFilters(
  recommendations: EnhancedCodeRecommendation[],
  selectedCodes?: Set<string>
): UseQuickFiltersReturn {
  
  const [activeFilters, setActiveFilters] = useState<Partial<QuickFilterOptions>>({});

  const filteredRecommendations = useMemo(() => {
    let filtered = [...recommendations];

    // Filter by category
    if (activeFilters.category) {
      filtered = filtered.filter(rec => rec.mbsCategory === activeFilters.category);
    }

    // Filter by fee range
    if (activeFilters.feeRange) {
      const { min, max } = activeFilters.feeRange;
      filtered = filtered.filter(rec => 
        rec.schedule_fee >= min && rec.schedule_fee <= max
      );
    }

    // Filter by confidence
    if (activeFilters.minConfidence !== undefined) {
      filtered = filtered.filter(rec => rec.confidence >= activeFilters.minConfidence!);
    }

    // Filter by compatibility with selected codes
    if (activeFilters.compatibilityFilter && selectedCodes && selectedCodes.size > 0) {
      switch (activeFilters.compatibilityFilter) {
        case 'compatible':
          filtered = filtered.filter(rec => {
            if (selectedCodes.has(rec.code)) return false; // Don't show already selected
            
            return Array.from(selectedCodes).every(selectedCode => {
              const selectedRec = recommendations.find(r => r.code === selectedCode);
              return selectedRec?.compatibleWith.includes(rec.code) ?? false;
            });
          });
          break;
        
        case 'conflicting':
          filtered = filtered.filter(rec => {
            return Array.from(selectedCodes).some(selectedCode => {
              const selectedRec = recommendations.find(r => r.code === selectedCode);
              return selectedRec?.conflicts.some(conflict => 
                conflict.conflictingCodes.includes(rec.code)
              ) ?? false;
            });
          });
          break;
        
        case 'all':
        default:
          // No additional filtering
          break;
      }
    }

    return filtered;
  }, [recommendations, activeFilters, selectedCodes]);

  const applyFilter = useCallback((filter: Partial<QuickFilterOptions>) => {
    setActiveFilters(prev => ({ ...prev, ...filter }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const clearFilter = useCallback((filterKey: keyof QuickFilterOptions) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  }, []);

  return {
    filteredRecommendations,
    activeFilters,
    applyFilter,
    clearFilters,
    clearFilter
  };
}

// ============================================================================
// Undo/Redo Hook
// ============================================================================

export interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addHistoryEntry: (entry: SelectionHistoryEntry) => void;
  clearHistory: () => void;
  history: SelectionHistoryEntry[];
}

/**
 * Hook for undo/redo functionality
 */
export function useUndoRedo(
  initialSelection: Set<string>,
  onSelectionChange?: (selection: Set<string>) => void,
  maxHistorySize: number = 50
): UseUndoRedoReturn {
  
  const [history, setHistory] = useState<SelectionHistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return;
    
    // For undo, we want to go back to the initial state or the state before the current entry
    if (currentIndex === 0) {
      // Go back to initial selection
      onSelectionChange?.(initialSelection);
    } else {
      // Go back to the previous entry
      const previousEntry = history[currentIndex - 1];
      const previousSelection = new Set(previousEntry.selectionState.selectedCodes);
      onSelectionChange?.(previousSelection);
    }
    
    setCurrentIndex(prev => prev - 1);
  }, [canUndo, history, currentIndex, onSelectionChange, initialSelection]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    
    // Get the next state
    const nextEntry = history[currentIndex + 1];
    const nextSelection = new Set(nextEntry.selectionState.selectedCodes);
    
    setCurrentIndex(prev => prev + 1);
    onSelectionChange?.(nextSelection);
  }, [canRedo, history, currentIndex, onSelectionChange]);

  const addHistoryEntry = useCallback((entry: SelectionHistoryEntry) => {
    setHistory(prev => {
      // Remove any entries after current index (when adding new entry after undo)
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add the new entry
      newHistory.push({
        ...entry,
        id: entry.id || `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: entry.timestamp || new Date().toISOString()
      });
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.splice(0, newHistory.length - maxHistorySize);
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [currentIndex, maxHistorySize]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    addHistoryEntry,
    clearHistory,
    history
  };
}

// ============================================================================
// Keyboard Shortcuts Hook
// ============================================================================

export interface UseKeyboardShortcutsReturn {
  activeShortcuts: Record<string, () => void>;
  registerShortcut: (key: string, handler: () => void) => void;
  unregisterShortcut: (key: string) => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(
  initialShortcuts: Record<string, () => void> = {}
): UseKeyboardShortcutsReturn {
  
  const [shortcuts, setShortcuts] = useState(initialShortcuts);
  const [isEnabled, setIsEnabled] = useState(true);

  // Parse key combination string (e.g., "ctrl+a", "shift+delete")
  const parseKeyCombo = useCallback((combo: string) => {
    const parts = combo.toLowerCase().split('+');
    return {
      key: parts[parts.length - 1],
      ctrl: parts.includes('ctrl'),
      shift: parts.includes('shift'),
      alt: parts.includes('alt'),
      meta: parts.includes('meta')
    };
  }, []);

  // Check if event matches key combination
  const matchesCombo = useCallback((event: KeyboardEvent, combo: string) => {
    const parsed = parseKeyCombo(combo);
    
    return (
      event.key.toLowerCase() === parsed.key &&
      event.ctrlKey === parsed.ctrl &&
      event.shiftKey === parsed.shift &&
      event.altKey === parsed.alt &&
      event.metaKey === parsed.meta
    );
  }, [parseKeyCombo]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEnabled) return;
      
      // Check if any shortcut matches
      for (const [combo, handler] of Object.entries(shortcuts)) {
        if (matchesCombo(event, combo)) {
          event.preventDefault();
          event.stopPropagation();
          handler();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, isEnabled, matchesCombo]);

  const registerShortcut = useCallback((key: string, handler: () => void) => {
    setShortcuts(prev => ({ ...prev, [key]: handler }));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => {
      const newShortcuts = { ...prev };
      delete newShortcuts[key];
      return newShortcuts;
    });
  }, []);

  const setEnabledWrapper = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  return {
    activeShortcuts: shortcuts,
    registerShortcut,
    unregisterShortcut,
    isEnabled,
    setEnabled: setEnabledWrapper
  };
}

// ============================================================================
// Combined Enhanced UX Hook
// ============================================================================

export interface UseEnhancedUXReturn {
  bulkOperations: UseBulkOperationsReturn;
  quickFilters: UseQuickFiltersReturn;
  undoRedo: UseUndoRedoReturn;
  keyboardShortcuts: UseKeyboardShortcutsReturn;
}

/**
 * Combined hook providing all enhanced UX features
 */
export function useEnhancedUX(
  recommendations: EnhancedCodeRecommendation[],
  selectedCodes: Set<string>,
  onSelectionChange?: (selection: Set<string>) => void
): UseEnhancedUXReturn {
  
  const bulkOperations = useBulkOperations(recommendations, onSelectionChange);
  const quickFilters = useQuickFilters(recommendations, selectedCodes);
  const undoRedo = useUndoRedo(selectedCodes, onSelectionChange);
  
  // Setup default keyboard shortcuts
  const defaultShortcuts = useMemo(() => ({
    'ctrl+a': bulkOperations.selectAll,
    'ctrl+z': undoRedo.undo,
    'ctrl+y': undoRedo.redo,
    'ctrl+shift+z': undoRedo.redo,
    'delete': bulkOperations.selectNone,
    'escape': () => quickFilters.clearFilters()
  }), [bulkOperations, undoRedo, quickFilters]);
  
  const keyboardShortcuts = useKeyboardShortcuts(defaultShortcuts);

  return {
    bulkOperations,
    quickFilters,
    undoRedo,
    keyboardShortcuts
  };
}