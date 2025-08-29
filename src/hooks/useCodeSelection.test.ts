/**
 * Tests for useCodeSelection hook
 * 
 * Tests the custom hook for managing MBS code selection with conflict detection.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useCodeSelection } from './useCodeSelection';
import { EnhancedCodeRecommendation } from '../types/api.types';

// Mock recommendations for testing
const mockRecommendations: EnhancedCodeRecommendation[] = [
  {
    code: '36',
    description: 'Level C consultation 40+ minutes',
    confidence: 0.85,
    schedule_fee: 75.05,
    category: '1',
    reasoning: 'Detailed consultation required',
    conflicts: [{
      conflictingCodes: ['36', '44'],
      reason: 'time_overlap',
      severity: 'blocking',
      message: 'Cannot bill with Level D consultation'
    }],
    compatibleWith: ['177', '721'],
    mbsCategory: 'professional_attendances',
    timeRequirement: 40
  },
  {
    code: '44',
    description: 'Level D consultation 60+ minutes',
    confidence: 0.75,
    schedule_fee: 105.55,
    category: '1',
    reasoning: 'Extended consultation required',
    conflicts: [{
      conflictingCodes: ['36', '44'],
      reason: 'time_overlap',
      severity: 'blocking',
      message: 'Cannot bill with Level C consultation'
    }],
    compatibleWith: ['177'],
    mbsCategory: 'professional_attendances',
    timeRequirement: 60
  },
  {
    code: '177',
    description: 'Basic consultation',
    confidence: 0.65,
    schedule_fee: 45.05,
    category: '1',
    reasoning: 'Standard consultation',
    conflicts: [],
    compatibleWith: ['36', '44', '721'],
    mbsCategory: 'professional_attendances'
  },
  {
    code: '721',
    description: 'Mental health consultation',
    confidence: 0.70,
    schedule_fee: 85.40,
    category: '14',
    reasoning: 'Mental health focused',
    conflicts: [{
      conflictingCodes: ['721', '723'],
      reason: 'frequency_limit',
      severity: 'warning',
      message: 'Consider frequency limits for mental health'
    }],
    compatibleWith: ['36', '177'],
    mbsCategory: 'mental_health'
  },
  {
    code: '723',
    description: 'Group mental health session',
    confidence: 0.60,
    schedule_fee: 45.20,
    category: '14',
    reasoning: 'Group therapy session',
    conflicts: [{
      conflictingCodes: ['721', '723'],
      reason: 'frequency_limit',
      severity: 'warning',
      message: 'Consider frequency limits for mental health'
    }],
    compatibleWith: [],
    mbsCategory: 'mental_health'
  }
];

describe('useCodeSelection Hook', () => {
  describe('Initial State', () => {
    test('should initialize with empty selection', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      expect(result.current.selectionState.selectedCodes.size).toBe(0);
      expect(result.current.selectionSummary.totalFee).toBe(0);
      expect(result.current.selectionSummary.selectedCount).toBe(0);
      expect(result.current.selectionValidation.isValid).toBe(true);
    });

    test('should initialize with provided initial selection', () => {
      const initialSelection = new Set(['36', '177']);
      const { result } = renderHook(() => 
        useCodeSelection(mockRecommendations, { initialSelection })
      );
      
      expect(result.current.selectionState.selectedCodes.has('36')).toBe(true);
      expect(result.current.selectionState.selectedCodes.has('177')).toBe(true);
      expect(result.current.selectionSummary.selectedCount).toBe(2);
      expect(result.current.selectionSummary.totalFee).toBe(120.10); // 75.05 + 45.05
    });
  });

  describe('Code Selection', () => {
    test('should select compatible code successfully', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      act(() => {
        const validation = result.current.selectCode('36', mockRecommendations[0]);
        expect(validation.canSelect).toBe(true);
        expect(validation.conflicts).toHaveLength(0);
      });
      
      expect(result.current.isCodeSelected('36')).toBe(true);
      expect(result.current.selectionSummary.selectedCount).toBe(1);
      expect(result.current.selectionSummary.totalFee).toBe(75.05);
    });

    test('should prevent selecting conflicting codes', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // First select code 36
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      // Try to select conflicting code 44
      act(() => {
        const validation = result.current.selectCode('44', mockRecommendations[1]);
        expect(validation.canSelect).toBe(false);
        expect(validation.conflicts).toHaveLength(1);
        expect(validation.conflicts[0].reason).toBe('time_overlap');
      });
      
      expect(result.current.isCodeSelected('44')).toBe(false);
      expect(result.current.selectionSummary.selectedCount).toBe(1);
    });

    test('should allow selecting compatible codes', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // Select code 36
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      // Select compatible code 177
      act(() => {
        const validation = result.current.selectCode('177', mockRecommendations[2]);
        expect(validation.canSelect).toBe(true);
        expect(validation.conflicts).toHaveLength(0);
      });
      
      expect(result.current.isCodeSelected('36')).toBe(true);
      expect(result.current.isCodeSelected('177')).toBe(true);
      expect(result.current.selectionSummary.selectedCount).toBe(2);
      expect(result.current.selectionSummary.totalFee).toBe(120.10); // 75.05 + 45.05
    });

    test('should handle warning-level conflicts', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // Select mental health code
      act(() => {
        result.current.selectCode('721', mockRecommendations[3]);
      });
      
      // Select another mental health code (warning conflict)
      act(() => {
        const validation = result.current.selectCode('723', mockRecommendations[4]);
        expect(validation.canSelect).toBe(true); // Should still be selectable
        expect(validation.warnings).toHaveLength(1);
        expect(validation.warnings[0]).toContain('frequency limits');
      });
      
      expect(result.current.isCodeSelected('721')).toBe(true);
      expect(result.current.isCodeSelected('723')).toBe(true);
      expect(result.current.selectionSummary.selectedCount).toBe(2);
    });

    test('should respect maximum code limit', () => {
      const { result } = renderHook(() => 
        useCodeSelection(mockRecommendations, { maxCodes: 1 })
      );
      
      // Select first code
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      // Try to select second code (should be blocked by limit)
      act(() => {
        const validation = result.current.selectCode('177', mockRecommendations[2]);
        expect(validation.canSelect).toBe(false);
        expect(validation.warnings[0]).toContain('Maximum 1 codes');
      });
      
      expect(result.current.isCodeSelected('36')).toBe(true);
      expect(result.current.isCodeSelected('177')).toBe(false);
      expect(result.current.selectionSummary.selectedCount).toBe(1);
    });
  });

  describe('Code Deselection', () => {
    test('should deselect code successfully', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // Select a code first
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      expect(result.current.isCodeSelected('36')).toBe(true);
      
      // Deselect the code
      act(() => {
        result.current.deselectCode('36');
      });
      
      expect(result.current.isCodeSelected('36')).toBe(false);
      expect(result.current.selectionSummary.selectedCount).toBe(0);
      expect(result.current.selectionSummary.totalFee).toBe(0);
    });

    test('should toggle code selection correctly', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // Toggle to select
      act(() => {
        const validation = result.current.toggleCodeSelection('36', mockRecommendations[0]);
        expect(validation.canSelect).toBe(true);
      });
      
      expect(result.current.isCodeSelected('36')).toBe(true);
      
      // Toggle to deselect
      act(() => {
        const validation = result.current.toggleCodeSelection('36', mockRecommendations[0]);
        expect(validation.canSelect).toBe(true);
      });
      
      expect(result.current.isCodeSelected('36')).toBe(false);
    });
  });

  describe('Selection State Management', () => {
    test('should clear all selections', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // Select first code
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      // Select second code
      act(() => {
        result.current.selectCode('177', mockRecommendations[2]);
      });
      
      expect(result.current.selectionSummary.selectedCount).toBe(2);
      
      // Clear all selections
      act(() => {
        result.current.clearSelection();
      });
      
      expect(result.current.selectionSummary.selectedCount).toBe(0);
      expect(result.current.selectionSummary.totalFee).toBe(0);
      expect(result.current.isCodeSelected('36')).toBe(false);
      expect(result.current.isCodeSelected('177')).toBe(false);
    });

    test('should calculate selection states correctly', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // Initially all should be available
      expect(result.current.getCodeSelectionState('36', mockRecommendations)).toBe('available');
      expect(result.current.getCodeSelectionState('44', mockRecommendations)).toBe('available');
      
      // Select code 36
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      expect(result.current.getCodeSelectionState('36', mockRecommendations)).toBe('selected');
      expect(result.current.getCodeSelectionState('44', mockRecommendations)).toBe('blocked'); // Conflicts with 36
      expect(result.current.getCodeSelectionState('177', mockRecommendations)).toBe('compatible'); // Compatible with 36
    });
  });

  describe('Callbacks', () => {
    test('should call onSelectionChange callback', () => {
      const onSelectionChange = vi.fn();
      const { result } = renderHook(() => 
        useCodeSelection(mockRecommendations, { onSelectionChange })
      );
      
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedCodes: expect.any(Set),
          totalFee: 75.05
        })
      );
    });

    test('should call onConflictDetected callback', () => {
      const onConflictDetected = vi.fn();
      const { result } = renderHook(() => 
        useCodeSelection(mockRecommendations, { onConflictDetected })
      );
      
      // Select first code
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      // Try to select conflicting code
      act(() => {
        result.current.selectCode('44', mockRecommendations[1]);
      });
      
      expect(onConflictDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          canSelect: false,
          conflicts: expect.arrayContaining([
            expect.objectContaining({
              reason: 'time_overlap',
              severity: 'blocking'
            })
          ])
        })
      );
    });
  });

  describe('Conflict Validation', () => {
    test('should validate selection correctly', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // Valid selection
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
        result.current.selectCode('177', mockRecommendations[2]);
      });
      
      expect(result.current.selectionValidation.isValid).toBe(true);
      expect(result.current.selectionValidation.blockingConflicts).toHaveLength(0);
      
      // Invalid selection (would need to force it by modifying state directly for testing)
      // This is more of an integration test scenario
    });

    test('should check code selectability', () => {
      const { result } = renderHook(() => useCodeSelection(mockRecommendations));
      
      // Initially all codes should be selectable
      let validation = result.current.canSelectCode('36', mockRecommendations);
      expect(validation.canSelect).toBe(true);
      
      // Select a code
      act(() => {
        result.current.selectCode('36', mockRecommendations[0]);
      });
      
      // Conflicting code should not be selectable
      validation = result.current.canSelectCode('44', mockRecommendations);
      expect(validation.canSelect).toBe(false);
      expect(validation.conflicts).toHaveLength(1);
      
      // Compatible code should still be selectable
      validation = result.current.canSelectCode('177', mockRecommendations);
      expect(validation.canSelect).toBe(true);
    });
  });
});