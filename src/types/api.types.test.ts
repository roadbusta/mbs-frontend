/**
 * Tests for Enhanced API Types - MBS Code Selection with Conflict Detection
 * 
 * Tests the new TypeScript interfaces for conflict detection and selection functionality.
 */

import { describe, test, expect } from 'vitest';
import {
  ConflictRule,
  ConflictReason,
  SelectionState,
  MBSCategory,
  ExclusionRule,
  ConflictValidation,
  SelectionSummary,
  EnhancedCodeRecommendation,
  validateCodeSelection,
  calculateSelectionSummary,
  detectConflicts,
} from './api.types';

describe('Enhanced API Types - Conflict Detection', () => {
  describe('ConflictRule Interface', () => {
    test('should create valid conflict rule for time overlap', () => {
      const conflictRule: ConflictRule = {
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'blocking',
        message: 'Cannot bill multiple consultation levels for same patient visit',
        category: 'professional_attendances'
      };
      
      expect(conflictRule.conflictingCodes).toHaveLength(2);
      expect(conflictRule.reason).toBe('time_overlap');
      expect(conflictRule.severity).toBe('blocking');
      expect(conflictRule.message).toContain('Cannot bill');
    });

    test('should create valid conflict rule for category exclusive', () => {
      const conflictRule: ConflictRule = {
        conflictingCodes: ['177', '179'],
        reason: 'category_exclusive',
        severity: 'blocking',
        message: 'Only one basic consultation can be billed per visit'
      };
      
      expect(conflictRule.reason).toBe('category_exclusive');
      expect(conflictRule.severity).toBe('blocking');
    });

    test('should create warning-level conflict rule', () => {
      const conflictRule: ConflictRule = {
        conflictingCodes: ['721', '723'],
        reason: 'frequency_limit',
        severity: 'warning',
        message: 'Consider frequency limits for mental health consultations'
      };
      
      expect(conflictRule.severity).toBe('warning');
      expect(conflictRule.reason).toBe('frequency_limit');
    });
  });

  describe('EnhancedCodeRecommendation Interface', () => {
    test('should extend original recommendation with conflict detection fields', () => {
      const recommendation: EnhancedCodeRecommendation = {
        // Original fields
        code: '36',
        description: 'Level C consultation 40+ minutes',
        confidence: 0.85,
        schedule_fee: 75.05,
        reasoning: 'Patient requires detailed assessment',
        category: '1',
        
        // New conflict detection fields
        conflicts: [
          {
            conflictingCodes: ['36', '44'],
            reason: 'time_overlap',
            severity: 'blocking',
            message: 'Cannot bill with Level D consultation'
          }
        ],
        compatibleWith: ['177', '721'],
        mbsCategory: 'professional_attendances',
        timeRequirement: 40,
        exclusionRules: [
          {
            excludedCodes: ['23'],
            reason: 'Brief consultation conflicts with extended consultation',
            conditions: ['same_day']
          }
        ]
      };
      
      expect(recommendation.code).toBe('36');
      expect(recommendation.conflicts).toHaveLength(1);
      expect(recommendation.compatibleWith).toContain('177');
      expect(recommendation.mbsCategory).toBe('professional_attendances');
      expect(recommendation.timeRequirement).toBe(40);
      expect(recommendation.exclusionRules).toBeDefined();
    });
  });

  describe('SelectionState Interface', () => {
    test('should manage selected codes and conflicts', () => {
      const selectionState: SelectionState = {
        selectedCodes: new Set(['36', '721']),
        conflicts: new Map([
          ['36', [{
            conflictingCodes: ['36', '44'],
            reason: 'time_overlap',
            severity: 'blocking',
            message: 'Cannot bill with Level D consultation'
          }]]
        ]),
        totalFee: 150.10,
        warnings: ['Consider billing frequency for mental health items']
      };
      
      expect(selectionState.selectedCodes.has('36')).toBe(true);
      expect(selectionState.selectedCodes.has('721')).toBe(true);
      expect(selectionState.conflicts.has('36')).toBe(true);
      expect(selectionState.totalFee).toBe(150.10);
      expect(selectionState.warnings).toHaveLength(1);
    });

    test('should handle empty selection state', () => {
      const emptyState: SelectionState = {
        selectedCodes: new Set(),
        conflicts: new Map(),
        totalFee: 0,
        warnings: []
      };
      
      expect(emptyState.selectedCodes.size).toBe(0);
      expect(emptyState.conflicts.size).toBe(0);
      expect(emptyState.totalFee).toBe(0);
      expect(emptyState.warnings).toHaveLength(0);
    });
  });
});

describe('Conflict Detection Functions', () => {
  const mockRecommendations: EnhancedCodeRecommendation[] = [
    {
      code: '36',
      description: 'Level C consultation 40+ minutes',
      confidence: 0.85,
      schedule_fee: 75.05,
      conflicts: [{
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'blocking',
        message: 'Cannot bill with Level D consultation'
      }],
      compatibleWith: ['177', '721'],
      mbsCategory: 'professional_attendances'
    },
    {
      code: '44',
      description: 'Level D consultation 60+ minutes',
      confidence: 0.75,
      schedule_fee: 105.55,
      conflicts: [{
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'blocking',
        message: 'Cannot bill with Level C consultation'
      }],
      compatibleWith: ['177'],
      mbsCategory: 'professional_attendances'
    },
    {
      code: '721',
      description: 'Mental health consultation',
      confidence: 0.65,
      schedule_fee: 85.40,
      conflicts: [],
      compatibleWith: ['36'],
      mbsCategory: 'mental_health'
    }
  ];

  describe('detectConflicts function', () => {
    test('should detect blocking conflict between Level C and D consultations', () => {
      const selectedCodes = new Set(['36']);
      const newCode = '44';
      
      const validation = detectConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(validation.canSelect).toBe(false);
      expect(validation.conflicts).toHaveLength(1);
      expect(validation.conflicts[0].reason).toBe('time_overlap');
      expect(validation.conflicts[0].severity).toBe('blocking');
    });

    test('should allow compatible code selection', () => {
      const selectedCodes = new Set(['36']);
      const newCode = '721';
      
      const validation = detectConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(validation.canSelect).toBe(true);
      expect(validation.conflicts).toHaveLength(0);
    });

    test('should handle empty selection', () => {
      const selectedCodes = new Set<string>();
      const newCode = '36';
      
      const validation = detectConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(validation.canSelect).toBe(true);
      expect(validation.conflicts).toHaveLength(0);
    });

    test('should handle warning-level conflicts', () => {
      // Test with mock data that has warning conflicts
      const warningRecommendation: EnhancedCodeRecommendation = {
        code: '723',
        description: 'Group mental health session',
        confidence: 0.60,
        schedule_fee: 45.20,
        conflicts: [{
          conflictingCodes: ['721', '723'],
          reason: 'frequency_limit',
          severity: 'warning',
          message: 'Consider frequency limits for mental health consultations'
        }],
        compatibleWith: [],
        mbsCategory: 'mental_health'
      };

      const recommendations = [...mockRecommendations, warningRecommendation];
      const selectedCodes = new Set(['721']);
      const newCode = '723';
      
      const validation = detectConflicts(selectedCodes, newCode, recommendations);
      
      expect(validation.canSelect).toBe(true);
      expect(validation.warnings).toHaveLength(1);
      expect(validation.warnings[0]).toContain('frequency limits');
    });
  });

  describe('calculateSelectionSummary function', () => {
    test('should calculate total fee for selected codes', () => {
      const selectedCodes = new Set(['36', '721']);
      
      const summary = calculateSelectionSummary(selectedCodes, mockRecommendations);
      
      expect(summary.totalFee).toBe(160.45); // 75.05 + 85.40
      expect(summary.selectedCount).toBe(2);
      expect(summary.conflictCount).toBe(0);
    });

    test('should identify conflicts in selection summary', () => {
      const selectedCodes = new Set(['36', '44']);
      
      const summary = calculateSelectionSummary(selectedCodes, mockRecommendations);
      
      expect(summary.selectedCount).toBe(2);
      expect(summary.conflictCount).toBeGreaterThan(0);
      expect(summary.hasBlockingConflicts).toBe(true);
    });

    test('should handle empty selection in summary', () => {
      const selectedCodes = new Set<string>();
      
      const summary = calculateSelectionSummary(selectedCodes, mockRecommendations);
      
      expect(summary.totalFee).toBe(0);
      expect(summary.selectedCount).toBe(0);
      expect(summary.conflictCount).toBe(0);
      expect(summary.hasBlockingConflicts).toBe(false);
    });
  });

  describe('validateCodeSelection function', () => {
    test('should validate entire selection state', () => {
      const selectionState: SelectionState = {
        selectedCodes: new Set(['36', '721']),
        conflicts: new Map(),
        totalFee: 160.45,
        warnings: []
      };
      
      const validation = validateCodeSelection(selectionState, mockRecommendations);
      
      expect(validation.isValid).toBe(true);
      expect(validation.blockingConflicts).toHaveLength(0);
    });

    test('should identify invalid selection with blocking conflicts', () => {
      const selectionState: SelectionState = {
        selectedCodes: new Set(['36', '44']),
        conflicts: new Map(),
        totalFee: 180.60,
        warnings: []
      };
      
      const validation = validateCodeSelection(selectionState, mockRecommendations);
      
      expect(validation.isValid).toBe(false);
      expect(validation.blockingConflicts.length).toBeGreaterThan(0);
    });
  });
});

describe('Type Guards and Utilities', () => {
  test('should validate ConflictReason enum values', () => {
    const validReasons: ConflictReason[] = [
      'time_overlap',
      'category_exclusive',
      'age_restriction',
      'frequency_limit',
      'prerequisite_missing',
      'medicare_rule'
    ];
    
    validReasons.forEach(reason => {
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    });
  });

  test('should validate MBSCategory enum values', () => {
    const validCategories: MBSCategory[] = [
      'professional_attendances',
      'diagnostic_procedures',
      'therapeutic_procedures',
      'oral_maxillofacial',
      'diagnostic_imaging',
      'pathology',
      'cleft_palate',
      'chemotherapy',
      'radiotherapy',
      'assistant_surgeon',
      'relative_value_guide',
      'acupuncture'
    ];
    
    validCategories.forEach(category => {
      expect(typeof category).toBe('string');
      expect(category.length).toBeGreaterThan(0);
    });
  });
});