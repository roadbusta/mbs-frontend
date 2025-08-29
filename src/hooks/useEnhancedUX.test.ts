/**
 * Test suite for Enhanced UX Features - Phase 4 TDD Implementation
 * 
 * Tests for bulk operations, quick filters, undo/redo, and keyboard shortcuts
 * Following TDD: Write failing tests first, then implement to make them pass
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useEnhancedUX,
  useBulkOperations,
  useQuickFilters,
  useUndoRedo,
  useKeyboardShortcuts
} from '../hooks/useEnhancedUX';
import {
  QuickFilterOptions,
  EnhancedCodeRecommendation,
  MBSCategory,
  SelectionHistoryEntry
} from '../types/api.types';

describe('useEnhancedUX', () => {
  let mockRecommendations: EnhancedCodeRecommendation[];

  beforeEach(() => {
    mockRecommendations = [
      {
        code: '23',
        description: 'Level A consultation',
        confidence: 0.9,
        schedule_fee: 41.20,
        category: '1',
        conflicts: [],
        compatibleWith: ['110', '57'],
        mbsCategory: 'professional_attendances' as MBSCategory,
        timeRequirement: 20,
        reasoning: 'Standard consultation'
      },
      {
        code: '36',
        description: 'Level C consultation',
        confidence: 0.8,
        schedule_fee: 80.55,
        category: '1',
        conflicts: [],
        compatibleWith: ['110'],
        mbsCategory: 'professional_attendances' as MBSCategory,
        timeRequirement: 40,
        reasoning: 'Extended consultation'
      },
      {
        code: '110',
        description: 'ECG recording',
        confidence: 0.85,
        schedule_fee: 19.80,
        category: '5',
        conflicts: [],
        compatibleWith: ['23', '36'],
        mbsCategory: 'diagnostic_procedures' as MBSCategory,
        timeRequirement: 10,
        reasoning: 'Diagnostic procedure'
      },
      {
        code: '57',
        description: 'Skin biopsy',
        confidence: 0.75,
        schedule_fee: 45.00,
        category: '2',
        conflicts: [],
        compatibleWith: ['23'],
        mbsCategory: 'therapeutic_procedures' as MBSCategory,
        timeRequirement: 15,
        reasoning: 'Minor surgical procedure'
      }
    ];
  });

  describe('useBulkOperations', () => {
    it('should provide bulk selection functionality', () => {
      const { result } = renderHook(() => useBulkOperations(mockRecommendations));

      expect(result.current).toHaveProperty('selectAll');
      expect(result.current).toHaveProperty('selectNone');
      expect(result.current).toHaveProperty('selectByCategory');
      expect(result.current).toHaveProperty('selectByFeeRange');
      expect(result.current).toHaveProperty('selectCompatibleWith');
      expect(result.current).toHaveProperty('invertSelection');
    });

    it('should select all available codes', () => {
      const mockOnSelectionChange = vi.fn();
      const { result } = renderHook(() => 
        useBulkOperations(mockRecommendations, mockOnSelectionChange)
      );

      act(() => {
        result.current.selectAll();
      });

      expect(mockOnSelectionChange).toHaveBeenCalledWith(
        new Set(['23', '36', '110', '57'])
      );
    });

    it('should clear all selections', () => {
      const mockOnSelectionChange = vi.fn();
      const { result } = renderHook(() => 
        useBulkOperations(mockRecommendations, mockOnSelectionChange)
      );

      act(() => {
        result.current.selectNone();
      });

      expect(mockOnSelectionChange).toHaveBeenCalledWith(new Set());
    });

    it('should select codes by category', () => {
      const mockOnSelectionChange = vi.fn();
      const { result } = renderHook(() => 
        useBulkOperations(mockRecommendations, mockOnSelectionChange)
      );

      act(() => {
        result.current.selectByCategory('professional_attendances');
      });

      expect(mockOnSelectionChange).toHaveBeenCalledWith(
        new Set(['23', '36'])
      );
    });

    it('should select codes by fee range', () => {
      const mockOnSelectionChange = vi.fn();
      const { result } = renderHook(() => 
        useBulkOperations(mockRecommendations, mockOnSelectionChange)
      );

      act(() => {
        result.current.selectByFeeRange(20, 50);
      });

      expect(mockOnSelectionChange).toHaveBeenCalledWith(
        new Set(['23', '57']) // fees: 41.20, 45.00
      );
    });

    it('should select compatible codes with a given selection', () => {
      const mockOnSelectionChange = vi.fn();
      const currentSelection = new Set(['23']);
      
      const { result } = renderHook(() => 
        useBulkOperations(mockRecommendations, mockOnSelectionChange)
      );

      act(() => {
        result.current.selectCompatibleWith(currentSelection);
      });

      expect(mockOnSelectionChange).toHaveBeenCalledWith(
        new Set(['23', '110', '57']) // codes compatible with '23'
      );
    });

    it('should invert current selection', () => {
      const mockOnSelectionChange = vi.fn();
      const currentSelection = new Set(['23', '36']);
      
      const { result } = renderHook(() => 
        useBulkOperations(mockRecommendations, mockOnSelectionChange)
      );

      act(() => {
        result.current.invertSelection(currentSelection);
      });

      expect(mockOnSelectionChange).toHaveBeenCalledWith(
        new Set(['110', '57']) // all codes except currently selected
      );
    });
  });

  describe('useQuickFilters', () => {
    it('should provide filtering functionality', () => {
      const { result } = renderHook(() => useQuickFilters(mockRecommendations));

      expect(result.current).toHaveProperty('filteredRecommendations');
      expect(result.current).toHaveProperty('activeFilters');
      expect(result.current).toHaveProperty('applyFilter');
      expect(result.current).toHaveProperty('clearFilters');
      expect(result.current).toHaveProperty('clearFilter');
    });

    it('should filter by category', () => {
      const { result } = renderHook(() => useQuickFilters(mockRecommendations));

      act(() => {
        result.current.applyFilter({
          category: 'professional_attendances'
        });
      });

      expect(result.current.filteredRecommendations).toHaveLength(2);
      expect(result.current.filteredRecommendations.every(r => 
        r.mbsCategory === 'professional_attendances'
      )).toBe(true);
    });

    it('should filter by fee range', () => {
      const { result } = renderHook(() => useQuickFilters(mockRecommendations));

      act(() => {
        result.current.applyFilter({
          feeRange: { min: 20, max: 50 }
        });
      });

      expect(result.current.filteredRecommendations).toHaveLength(2);
      expect(result.current.filteredRecommendations.every(r => 
        r.schedule_fee >= 20 && r.schedule_fee <= 50
      )).toBe(true);
    });

    it('should filter by confidence threshold', () => {
      const { result } = renderHook(() => useQuickFilters(mockRecommendations));

      act(() => {
        result.current.applyFilter({
          minConfidence: 0.8
        });
      });

      expect(result.current.filteredRecommendations).toHaveLength(3);
      expect(result.current.filteredRecommendations.every(r => 
        r.confidence >= 0.8
      )).toBe(true);
    });

    it('should filter by compatibility', () => {
      const selectedCodes = new Set(['23']);
      const { result } = renderHook(() => useQuickFilters(mockRecommendations, selectedCodes));

      act(() => {
        result.current.applyFilter({
          compatibilityFilter: 'compatible'
        });
      });

      // Should show codes compatible with '23': ['110', '57']
      expect(result.current.filteredRecommendations).toHaveLength(2);
      expect(result.current.filteredRecommendations.every(r => 
        ['110', '57'].includes(r.code)
      )).toBe(true);
    });

    it('should combine multiple filters', () => {
      const { result } = renderHook(() => useQuickFilters(mockRecommendations));

      act(() => {
        result.current.applyFilter({
          category: 'professional_attendances',
          feeRange: { min: 70, max: 100 }
        });
      });

      expect(result.current.filteredRecommendations).toHaveLength(1);
      expect(result.current.filteredRecommendations[0].code).toBe('36');
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useQuickFilters(mockRecommendations));

      act(() => {
        result.current.applyFilter({
          category: 'professional_attendances'
        });
      });

      expect(result.current.filteredRecommendations).toHaveLength(2);

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filteredRecommendations).toHaveLength(4);
      expect(Object.keys(result.current.activeFilters)).toHaveLength(0);
    });

    it('should clear specific filter', () => {
      const { result } = renderHook(() => useQuickFilters(mockRecommendations));

      act(() => {
        result.current.applyFilter({
          category: 'professional_attendances',
          minConfidence: 0.8
        });
      });

      act(() => {
        result.current.clearFilter('category');
      });

      expect(result.current.activeFilters).not.toHaveProperty('category');
      expect(result.current.activeFilters).toHaveProperty('minConfidence');
    });
  });

  describe('useUndoRedo', () => {
    it('should provide undo/redo functionality', () => {
      const { result } = renderHook(() => useUndoRedo(new Set()));

      expect(result.current).toHaveProperty('canUndo');
      expect(result.current).toHaveProperty('canRedo');
      expect(result.current).toHaveProperty('undo');
      expect(result.current).toHaveProperty('redo');
      expect(result.current).toHaveProperty('addHistoryEntry');
      expect(result.current).toHaveProperty('clearHistory');
      expect(result.current).toHaveProperty('history');
    });

    it('should track selection history', () => {
      const initialSelection = new Set(['23']);
      const { result } = renderHook(() => useUndoRedo(initialSelection));

      act(() => {
        result.current.addHistoryEntry({
          id: 'entry-1',
          action: 'select',
          code: '36',
          selectionState: {
            selectedCodes: ['23', '36'],
            totalFee: 121.75
          },
          timestamp: new Date().toISOString()
        });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('should undo selection changes', () => {
      const mockOnSelectionChange = vi.fn();
      const initialSelection = new Set(['23']);
      
      const { result } = renderHook(() => 
        useUndoRedo(initialSelection, mockOnSelectionChange)
      );

      // Add history entry
      act(() => {
        result.current.addHistoryEntry({
          id: 'entry-1',
          action: 'select',
          code: '36',
          selectionState: {
            selectedCodes: ['23', '36'],
            totalFee: 121.75
          },
          timestamp: new Date().toISOString()
        });
      });

      // Undo the change
      act(() => {
        result.current.undo();
      });

      expect(mockOnSelectionChange).toHaveBeenCalledWith(new Set(['23']));
      expect(result.current.canRedo).toBe(true);
    });

    it('should redo selection changes', () => {
      const mockOnSelectionChange = vi.fn();
      const initialSelection = new Set(['23']);
      
      const { result } = renderHook(() => 
        useUndoRedo(initialSelection, mockOnSelectionChange)
      );

      // Add history and undo
      act(() => {
        result.current.addHistoryEntry({
          id: 'entry-1',
          action: 'select',
          code: '36',
          selectionState: {
            selectedCodes: ['23', '36'],
            totalFee: 121.75
          },
          timestamp: new Date().toISOString()
        });
      });

      act(() => {
        result.current.undo();
      });

      // Now redo
      act(() => {
        result.current.redo();
      });

      expect(mockOnSelectionChange).toHaveBeenLastCalledWith(new Set(['23', '36']));
      expect(result.current.canRedo).toBe(false);
    });

    it('should limit history size', () => {
      const { result } = renderHook(() => useUndoRedo(new Set(), undefined, 3));

      // Add more entries than the limit
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.addHistoryEntry({
            id: `entry-${i}`,
            action: 'select',
            code: `code-${i}`,
            selectionState: {
              selectedCodes: [`code-${i}`],
              totalFee: 100 + i
            },
            timestamp: new Date().toISOString()
          });
        });
      }

      expect(result.current.history).toHaveLength(3);
      expect(result.current.history[0].id).toBe('entry-2'); // Oldest entries removed
    });

    it('should clear history', () => {
      const { result } = renderHook(() => useUndoRedo(new Set()));

      act(() => {
        result.current.addHistoryEntry({
          id: 'entry-1',
          action: 'select',
          code: '23',
          selectionState: {
            selectedCodes: ['23'],
            totalFee: 41.20
          },
          timestamp: new Date().toISOString()
        });
      });

      expect(result.current.history).toHaveLength(1);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('useKeyboardShortcuts', () => {
    it('should register keyboard shortcuts', () => {
      const shortcuts = {
        'ctrl+a': vi.fn(),
        'ctrl+z': vi.fn(),
        'ctrl+y': vi.fn(),
        'delete': vi.fn(),
        'escape': vi.fn()
      };

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));

      expect(result.current).toHaveProperty('activeShortcuts');
      expect(result.current).toHaveProperty('registerShortcut');
      expect(result.current).toHaveProperty('unregisterShortcut');
      expect(result.current).toHaveProperty('isEnabled');
      expect(result.current).toHaveProperty('setEnabled');
    });

    it('should trigger shortcuts on key events', () => {
      const selectAllMock = vi.fn();
      const undoMock = vi.fn();
      
      const shortcuts = {
        'ctrl+a': selectAllMock,
        'ctrl+z': undoMock
      };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Simulate Ctrl+A
      const ctrlAEvent = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true
      });
      document.dispatchEvent(ctrlAEvent);

      expect(selectAllMock).toHaveBeenCalled();
    });

    it('should prevent default browser behavior for registered shortcuts', () => {
      const selectAllMock = vi.fn();
      
      const shortcuts = {
        'ctrl+a': selectAllMock
      };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true
      });
      
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should register new shortcuts dynamically', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({}));

      const newShortcutHandler = vi.fn();

      act(() => {
        result.current.registerShortcut('ctrl+s', newShortcutHandler);
      });

      expect(result.current.activeShortcuts).toHaveProperty('ctrl+s');

      // Simulate Ctrl+S
      const ctrlSEvent = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true
      });
      document.dispatchEvent(ctrlSEvent);

      expect(newShortcutHandler).toHaveBeenCalled();
    });

    it('should unregister shortcuts', () => {
      const initialShortcuts = {
        'ctrl+a': vi.fn()
      };

      const { result } = renderHook(() => useKeyboardShortcuts(initialShortcuts));

      act(() => {
        result.current.unregisterShortcut('ctrl+a');
      });

      expect(result.current.activeShortcuts).not.toHaveProperty('ctrl+a');
    });

    it('should enable/disable shortcuts', () => {
      const selectAllMock = vi.fn();
      const shortcuts = {
        'ctrl+a': selectAllMock
      };

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        result.current.setEnabled(false);
      });

      expect(result.current.isEnabled).toBe(false);

      // Shortcuts should not fire when disabled
      const ctrlAEvent = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true
      });
      document.dispatchEvent(ctrlAEvent);

      expect(selectAllMock).not.toHaveBeenCalled();
    });
  });
});