/**
 * Test suite for Selection Management Tools - Phase 4 TDD Implementation
 * 
 * Tests for save/load presets, comparison, optimisation, and history management
 * Following TDD: Write failing tests first, then implement to make them pass
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useSelectionPresets,
  useSelectionComparison,
  useSelectionOptimization,
  useSelectionHistory
} from '../hooks/useSelectionManagement';
import {
  SelectionPreset,
  OptimizationSuggestion,
  SelectionHistoryEntry,
  EnhancedCodeRecommendation,
  MBSCategory
} from '../types/api.types';

describe('useSelectionPresets', () => {
  let mockRecommendations: EnhancedCodeRecommendation[];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockRecommendations = [
      {
        code: '23',
        description: 'Level A consultation',
        confidence: 0.9,
        schedule_fee: 41.20,
        category: '1',
        conflicts: [],
        compatibleWith: ['110'],
        mbsCategory: 'professional_attendances' as MBSCategory,
        timeRequirement: 20
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
        timeRequirement: 40
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
        timeRequirement: 10
      }
    ];
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should provide preset management functionality', () => {
    const { result } = renderHook(() => useSelectionPresets());

    expect(result.current).toHaveProperty('presets');
    expect(result.current).toHaveProperty('savePreset');
    expect(result.current).toHaveProperty('loadPreset');
    expect(result.current).toHaveProperty('deletePreset');
    expect(result.current).toHaveProperty('updatePreset');
    expect(result.current).toHaveProperty('duplicatePreset');
  });

  it('should save a new preset', () => {
    const { result } = renderHook(() => useSelectionPresets());

    const preset: Omit<SelectionPreset, 'id' | 'createdAt' | 'modifiedAt'> = {
      name: 'Cardiac Consultation',
      description: 'Standard consultation with ECG',
      selectedCodes: ['23', '110']
    };

    act(() => {
      result.current.savePreset(preset);
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Cardiac Consultation');
    expect(result.current.presets[0].selectedCodes).toEqual(['23', '110']);
    expect(result.current.presets[0]).toHaveProperty('id');
    expect(result.current.presets[0]).toHaveProperty('createdAt');
    expect(result.current.presets[0]).toHaveProperty('modifiedAt');
  });

  it('should load a preset', () => {
    const mockOnSelectionChange = vi.fn();
    const { result } = renderHook(() => useSelectionPresets(mockOnSelectionChange));

    // First save a preset
    const preset = {
      name: 'Test Preset',
      selectedCodes: ['23', '110']
    };

    act(() => {
      result.current.savePreset(preset);
    });

    const savedPreset = result.current.presets[0];

    // Then load it
    act(() => {
      result.current.loadPreset(savedPreset.id);
    });

    expect(mockOnSelectionChange).toHaveBeenCalledWith(new Set(['23', '110']));
  });

  it('should delete a preset', () => {
    const { result } = renderHook(() => useSelectionPresets());

    const preset = {
      name: 'Test Preset',
      selectedCodes: ['23', '110']
    };

    act(() => {
      result.current.savePreset(preset);
    });

    expect(result.current.presets).toHaveLength(1);
    const presetId = result.current.presets[0].id;

    act(() => {
      result.current.deletePreset(presetId);
    });

    expect(result.current.presets).toHaveLength(0);
  });

  it('should update a preset', () => {
    const { result } = renderHook(() => useSelectionPresets());

    const preset = {
      name: 'Original Name',
      selectedCodes: ['23']
    };

    act(() => {
      result.current.savePreset(preset);
    });

    const presetId = result.current.presets[0].id;

    act(() => {
      result.current.updatePreset(presetId, {
        name: 'Updated Name',
        selectedCodes: ['23', '110'],
        description: 'Added description'
      });
    });

    expect(result.current.presets[0].name).toBe('Updated Name');
    expect(result.current.presets[0].selectedCodes).toEqual(['23', '110']);
    expect(result.current.presets[0].description).toBe('Added description');
  });

  it('should duplicate a preset', () => {
    const { result } = renderHook(() => useSelectionPresets());

    const preset = {
      name: 'Original Preset',
      selectedCodes: ['23', '110']
    };

    act(() => {
      result.current.savePreset(preset);
    });

    const originalId = result.current.presets[0].id;

    act(() => {
      result.current.duplicatePreset(originalId, 'Copy of Original Preset');
    });

    expect(result.current.presets).toHaveLength(2);
    expect(result.current.presets[1].name).toBe('Copy of Original Preset');
    expect(result.current.presets[1].selectedCodes).toEqual(['23', '110']);
    expect(result.current.presets[1].id).not.toBe(originalId);
  });

  it('should persist presets to localStorage', () => {
    const { result } = renderHook(() => useSelectionPresets());

    const preset = {
      name: 'Test Preset',
      selectedCodes: ['23', '110']
    };

    act(() => {
      result.current.savePreset(preset);
    });

    // Check that data is saved to localStorage
    const savedData = localStorage.getItem('mbs-selection-presets');
    expect(savedData).not.toBeNull();
    
    const parsedData = JSON.parse(savedData!);
    expect(parsedData).toHaveLength(1);
    expect(parsedData[0].name).toBe('Test Preset');
  });

  it('should load presets from localStorage on initialization', () => {
    // Pre-populate localStorage
    const existingPresets: SelectionPreset[] = [{
      id: 'preset-1',
      name: 'Existing Preset',
      selectedCodes: ['36'],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    }];
    
    localStorage.setItem('mbs-selection-presets', JSON.stringify(existingPresets));

    const { result } = renderHook(() => useSelectionPresets());

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Existing Preset');
  });
});

describe('useSelectionComparison', () => {
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
        compatibleWith: ['110'],
        mbsCategory: 'professional_attendances' as MBSCategory
      },
      {
        code: '36',
        description: 'Level C consultation',
        confidence: 0.8,
        schedule_fee: 80.55,
        category: '1',
        conflicts: [],
        compatibleWith: ['110'],
        mbsCategory: 'professional_attendances' as MBSCategory
      },
      {
        code: '110',
        description: 'ECG recording',
        confidence: 0.85,
        schedule_fee: 19.80,
        category: '5',
        conflicts: [],
        compatibleWith: ['23', '36'],
        mbsCategory: 'diagnostic_procedures' as MBSCategory
      }
    ];
  });

  it('should provide comparison functionality', () => {
    const { result } = renderHook(() => useSelectionComparison(mockRecommendations));

    expect(result.current).toHaveProperty('compareSelections');
    expect(result.current).toHaveProperty('comparisonResults');
    expect(result.current).toHaveProperty('clearComparison');
  });

  it('should compare two selections', () => {
    const { result } = renderHook(() => useSelectionComparison(mockRecommendations));

    const selection1 = new Set(['23', '110']);
    const selection2 = new Set(['36', '110']);

    act(() => {
      result.current.compareSelections(selection1, selection2, 'Basic vs Extended');
    });

    expect(result.current.comparisonResults).not.toBeNull();
    expect(result.current.comparisonResults!.name).toBe('Basic vs Extended');
    expect(result.current.comparisonResults!.selection1.totalFee).toBe(61.00); // 41.20 + 19.80
    expect(result.current.comparisonResults!.selection2.totalFee).toBe(100.35); // 80.55 + 19.80
    expect(result.current.comparisonResults!.feeDifference).toBe(39.35);
  });

  it('should identify unique codes in each selection', () => {
    const { result } = renderHook(() => useSelectionComparison(mockRecommendations));

    const selection1 = new Set(['23', '110']);
    const selection2 = new Set(['36', '110']);

    act(() => {
      result.current.compareSelections(selection1, selection2, 'Test Comparison');
    });

    const comparison = result.current.comparisonResults!;
    
    expect(comparison.uniqueToSelection1).toEqual(['23']);
    expect(comparison.uniqueToSelection2).toEqual(['36']);
    expect(comparison.commonCodes).toEqual(['110']);
  });

  it('should calculate conflict differences', () => {
    // Mock recommendations with conflicts
    const conflictedRecommendations = [
      ...mockRecommendations,
      {
        code: '44',
        description: 'Level D consultation',
        confidence: 0.7,
        schedule_fee: 120.00,
        category: '1',
        conflicts: [{
          conflictingCodes: ['44', '36'],
          reason: 'category_exclusive_consultation' as const,
          severity: 'blocking' as const,
          message: 'Cannot bill multiple consultation levels'
        }],
        compatibleWith: ['110'],
        mbsCategory: 'professional_attendances' as MBSCategory
      }
    ];

    const { result } = renderHook(() => 
      useSelectionComparison(conflictedRecommendations)
    );

    const selection1 = new Set(['36', '110']); // No conflicts
    const selection2 = new Set(['36', '44']); // Conflict between 36 and 44

    act(() => {
      result.current.compareSelections(selection1, selection2, 'Conflict Test');
    });

    const comparison = result.current.comparisonResults!;
    
    expect(comparison.selection1.conflictCount).toBe(0);
    expect(comparison.selection2.conflictCount).toBeGreaterThan(0);
  });

  it('should clear comparison results', () => {
    const { result } = renderHook(() => useSelectionComparison(mockRecommendations));

    const selection1 = new Set(['23']);
    const selection2 = new Set(['36']);

    act(() => {
      result.current.compareSelections(selection1, selection2, 'Test');
    });

    expect(result.current.comparisonResults).not.toBeNull();

    act(() => {
      result.current.clearComparison();
    });

    expect(result.current.comparisonResults).toBeNull();
  });
});

describe('useSelectionOptimization', () => {
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
        compatibleWith: ['110'],
        mbsCategory: 'professional_attendances' as MBSCategory
      },
      {
        code: '36',
        description: 'Level C consultation',
        confidence: 0.8,
        schedule_fee: 80.55,
        category: '1',
        conflicts: [],
        compatibleWith: ['110'],
        mbsCategory: 'professional_attendances' as MBSCategory
      },
      {
        code: '110',
        description: 'ECG recording',
        confidence: 0.85,
        schedule_fee: 19.80,
        category: '5',
        conflicts: [],
        compatibleWith: ['23', '36'],
        mbsCategory: 'diagnostic_procedures' as MBSCategory
      },
      {
        code: '57',
        description: 'Minor procedure',
        confidence: 0.7,
        schedule_fee: 45.00,
        category: '2',
        conflicts: [],
        compatibleWith: ['23', '36', '110'],
        mbsCategory: 'therapeutic_procedures' as MBSCategory
      }
    ];
  });

  it('should provide optimisation functionality', () => {
    const { result } = renderHook(() => useSelectionOptimization(mockRecommendations));

    expect(result.current).toHaveProperty('generateOptimizationSuggestions');
    expect(result.current).toHaveProperty('optimisationResults');
    expect(result.current).toHaveProperty('applyOptimization');
    expect(result.current).toHaveProperty('clearOptimization');
  });

  it('should suggest fee maximization', () => {
    const { result } = renderHook(() => useSelectionOptimization(mockRecommendations));

    const currentSelection = new Set(['23', '110']); // Total: 61.00

    act(() => {
      result.current.generateOptimizationSuggestions(currentSelection, 'maximize_fee');
    });

    const suggestions = result.current.optimisationResults;
    expect(suggestions).not.toBeNull();
    expect(suggestions!.some(s => s.type === 'maximize_fee')).toBe(true);
    
    const maxFeeSuggestion = suggestions!.find(s => s.type === 'maximize_fee')!;
    expect(maxFeeSuggestion.suggestedFee).toBeGreaterThan(maxFeeSuggestion.currentFee);
  });

  it('should suggest upgrade opportunities', () => {
    const { result } = renderHook(() => useSelectionOptimization(mockRecommendations));

    const currentSelection = new Set(['23']); // Level A consultation

    act(() => {
      result.current.generateOptimizationSuggestions(currentSelection, 'upgrade_codes');
    });

    const suggestions = result.current.optimisationResults;
    const upgradeSuggestion = suggestions!.find(s => s.type === 'upgrade_codes');
    
    expect(upgradeSuggestion).toBeDefined();
    expect(upgradeSuggestion!.changes.some(c => 
      c.action === 'replace' && c.code === '36'
    )).toBe(true);
  });

  it('should suggest compatible code additions', () => {
    const { result } = renderHook(() => useSelectionOptimization(mockRecommendations));

    const currentSelection = new Set(['23']); // Only consultation

    act(() => {
      result.current.generateOptimizationSuggestions(currentSelection, 'add_compatible');
    });

    const suggestions = result.current.optimisationResults;
    const addCompatibleSuggestion = suggestions!.find(s => s.type === 'add_compatible');
    
    expect(addCompatibleSuggestion).toBeDefined();
    expect(addCompatibleSuggestion!.changes.some(c => 
      c.action === 'add' && ['110', '57'].includes(c.code)
    )).toBe(true);
  });

  it('should suggest conflict minimization', () => {
    // Create recommendations with conflicts
    const conflictedRecommendations = [
      ...mockRecommendations,
      {
        code: '44',
        description: 'Level D consultation',
        confidence: 0.7,
        schedule_fee: 120.00,
        category: '1',
        conflicts: [{
          conflictingCodes: ['44', '23'],
          reason: 'category_exclusive_consultation' as const,
          severity: 'blocking' as const,
          message: 'Cannot bill multiple consultation levels'
        }],
        compatibleWith: ['110'],
        mbsCategory: 'professional_attendances' as MBSCategory
      }
    ];

    const { result } = renderHook(() => 
      useSelectionOptimization(conflictedRecommendations)
    );

    const conflictedSelection = new Set(['23', '44']); // Has conflicts

    act(() => {
      result.current.generateOptimizationSuggestions(conflictedSelection, 'minimize_conflicts');
    });

    const suggestions = result.current.optimisationResults;
    const conflictSuggestion = suggestions!.find(s => s.type === 'minimize_conflicts');
    
    expect(conflictSuggestion).toBeDefined();
    expect(conflictSuggestion!.changes.some(c => 
      c.action === 'remove'
    )).toBe(true);
  });

  it('should apply optimisation suggestions', () => {
    const mockOnSelectionChange = vi.fn();
    const { result } = renderHook(() => 
      useSelectionOptimization(mockRecommendations, mockOnSelectionChange)
    );

    const suggestion: OptimizationSuggestion = {
      type: 'maximize_fee',
      currentFee: 61.00,
      suggestedFee: 100.35,
      improvement: 39.35,
      changes: [
        {
          action: 'replace',
          code: '36',
          description: 'Replace Level A with Level C',
          reason: 'Higher fee for extended consultation'
        }
      ],
      confidence: 0.8
    };

    const currentSelection = new Set(['23', '110']);

    act(() => {
      result.current.applyOptimization(suggestion, currentSelection);
    });

    expect(mockOnSelectionChange).toHaveBeenCalledWith(new Set(['36', '110']));
  });

  it('should clear optimisation results', () => {
    const { result } = renderHook(() => useSelectionOptimization(mockRecommendations));

    const currentSelection = new Set(['23']);

    act(() => {
      result.current.generateOptimizationSuggestions(currentSelection, 'maximize_fee');
    });

    expect(result.current.optimisationResults).not.toBeNull();

    act(() => {
      result.current.clearOptimization();
    });

    expect(result.current.optimisationResults).toBeNull();
  });
});

describe('useSelectionHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should provide selection history functionality', () => {
    const { result } = renderHook(() => useSelectionHistory());

    expect(result.current).toHaveProperty('history');
    expect(result.current).toHaveProperty('addEntry');
    expect(result.current).toHaveProperty('clearHistory');
    expect(result.current).toHaveProperty('getHistoryByDate');
    expect(result.current).toHaveProperty('getHistoryByAction');
  });

  it('should add history entries', () => {
    const { result } = renderHook(() => useSelectionHistory());

    const entry: Omit<SelectionHistoryEntry, 'id' | 'timestamp'> = {
      action: 'select',
      code: '23',
      selectionState: {
        selectedCodes: ['23'],
        totalFee: 41.20
      }
    };

    act(() => {
      result.current.addEntry(entry);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].action).toBe('select');
    expect(result.current.history[0].code).toBe('23');
    expect(result.current.history[0]).toHaveProperty('id');
    expect(result.current.history[0]).toHaveProperty('timestamp');
  });

  it('should maintain history order (newest first)', () => {
    const { result } = renderHook(() => useSelectionHistory());

    const entry1 = {
      action: 'select' as const,
      code: '23',
      selectionState: { selectedCodes: ['23'], totalFee: 41.20 }
    };

    const entry2 = {
      action: 'select' as const,
      code: '110',
      selectionState: { selectedCodes: ['23', '110'], totalFee: 61.00 }
    };

    act(() => {
      result.current.addEntry(entry1);
    });

    act(() => {
      result.current.addEntry(entry2);
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].code).toBe('110'); // Most recent first
    expect(result.current.history[1].code).toBe('23');
  });

  it('should filter history by date range', () => {
    const { result } = renderHook(() => useSelectionHistory());

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Add an entry (it will have today's timestamp)
    act(() => {
      result.current.addEntry({
        action: 'select',
        code: '23',
        selectionState: { selectedCodes: ['23'], totalFee: 41.20 }
      });
    });

    // Test filtering for today's range
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayEntries = result.current.getHistoryByDate(todayStart, todayEnd);
    expect(todayEntries).toHaveLength(1);

    // Test filtering for tomorrow's range (should be empty)
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000);

    const tomorrowEntries = result.current.getHistoryByDate(tomorrowStart, tomorrowEnd);
    expect(tomorrowEntries).toHaveLength(0);
  });

  it('should filter history by action type', () => {
    const { result } = renderHook(() => useSelectionHistory());

    act(() => {
      result.current.addEntry({
        action: 'select',
        code: '23',
        selectionState: { selectedCodes: ['23'], totalFee: 41.20 }
      });
    });

    act(() => {
      result.current.addEntry({
        action: 'deselect',
        code: '23',
        selectionState: { selectedCodes: [], totalFee: 0 }
      });
    });

    act(() => {
      result.current.addEntry({
        action: 'clear',
        selectionState: { selectedCodes: [], totalFee: 0 }
      });
    });

    const selectEntries = result.current.getHistoryByAction('select');
    const deselectEntries = result.current.getHistoryByAction('deselect');
    const clearEntries = result.current.getHistoryByAction('clear');

    expect(selectEntries).toHaveLength(1);
    expect(deselectEntries).toHaveLength(1);
    expect(clearEntries).toHaveLength(1);
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useSelectionHistory());

    act(() => {
      result.current.addEntry({
        action: 'select',
        code: '23',
        selectionState: { selectedCodes: ['23'], totalFee: 41.20 }
      });
    });

    expect(result.current.history).toHaveLength(1);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toHaveLength(0);
  });

  it('should persist history to localStorage', () => {
    const { result } = renderHook(() => useSelectionHistory());

    const entry = {
      action: 'select' as const,
      code: '23',
      selectionState: { selectedCodes: ['23'], totalFee: 41.20 }
    };

    act(() => {
      result.current.addEntry(entry);
    });

    const savedData = localStorage.getItem('mbs-selection-history');
    expect(savedData).not.toBeNull();
    
    const parsedData = JSON.parse(savedData!);
    expect(parsedData).toHaveLength(1);
    expect(parsedData[0].action).toBe('select');
  });

  it('should load history from localStorage on initialization', () => {
    const existingHistory: SelectionHistoryEntry[] = [{
      id: 'history-1',
      action: 'select',
      code: '36',
      selectionState: {
        selectedCodes: ['36'],
        totalFee: 80.55
      },
      timestamp: new Date().toISOString()
    }];
    
    localStorage.setItem('mbs-selection-history', JSON.stringify(existingHistory));

    const { result } = renderHook(() => useSelectionHistory());

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].code).toBe('36');
  });

  it('should limit history size', () => {
    const { result } = renderHook(() => useSelectionHistory(5)); // Limit to 5 entries

    // Add more entries than the limit
    for (let i = 0; i < 8; i++) {
      act(() => {
        result.current.addEntry({
          action: 'select',
          code: `code-${i}`,
          selectionState: { selectedCodes: [`code-${i}`], totalFee: 100 + i }
        });
      });
    }

    expect(result.current.history).toHaveLength(5);
    expect(result.current.history[0].code).toBe('code-7'); // Most recent
    expect(result.current.history[4].code).toBe('code-3'); // 5th most recent
  });
});