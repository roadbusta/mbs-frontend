/**
 * Test-Driven Development for Enhanced Conflict Detection Engine
 * 
 * Tests for comprehensive MBS code conflict detection with real medical billing rules.
 * Covers time overlap, category exclusivity, age restrictions, and complex multi-code scenarios.
 */

import { describe, test, expect } from 'vitest';
import {
  EnhancedCodeRecommendation,
  ConflictRule,
  // detectConflicts,
  validateComplexConflicts,
  generateConflictRules,
  MBSCategory
} from './api.types';

// Enhanced conflict detection functions we need to implement
declare function validateComplexConflicts(
  selectedCodes: Set<string>,
  newCode: string,
  allRecommendations: EnhancedCodeRecommendation[]
): {
  canSelect: boolean;
  conflicts: ConflictRule[];
  warnings: string[];
  suggestions: string[];
  compatibleCodes: string[];
};

declare function generateConflictRules(
  code: string,
  category: MBSCategory,
  timeRequirement?: number
): ConflictRule[];

// Mock recommendations for comprehensive testing
const mockRecommendations: EnhancedCodeRecommendation[] = [
  // Consultation codes - different levels
  {
    code: '23',
    description: 'Level A consultation (< 20 minutes)',
    confidence: 0.9,
    schedule_fee: 41.20,
    category: '1',
    reasoning: 'Brief consultation',
    conflicts: [],
    compatibleWith: ['177', '721'],
    mbsCategory: 'professional_attendances',
    timeRequirement: 15,
    exclusionRules: []
  },
  {
    code: '36',
    description: 'Level C consultation (20-40 minutes)',
    confidence: 0.85,
    schedule_fee: 75.05,
    category: '1',
    reasoning: 'Standard consultation',
    conflicts: [],
    compatibleWith: ['177', '721'],
    mbsCategory: 'professional_attendances',
    timeRequirement: 30,
    exclusionRules: []
  },
  {
    code: '44',
    description: 'Level D consultation (40+ minutes)',
    confidence: 0.8,
    schedule_fee: 105.55,
    category: '1',
    reasoning: 'Extended consultation',
    conflicts: [],
    compatibleWith: ['177'],
    mbsCategory: 'professional_attendances',
    timeRequirement: 45,
    exclusionRules: []
  },
  // Procedure codes
  {
    code: '177',
    description: 'Wound suturing < 7cm',
    confidence: 0.75,
    schedule_fee: 62.15,
    category: '1',
    reasoning: 'Minor procedure',
    conflicts: [],
    compatibleWith: ['23', '36', '44', '721'],
    mbsCategory: 'therapeutic_procedures',
    timeRequirement: 10,
    exclusionRules: []
  },
  {
    code: '721',
    description: 'Basic diagnostic imaging',
    confidence: 0.7,
    schedule_fee: 45.30,
    category: '2',
    reasoning: 'Diagnostic procedure',
    conflicts: [],
    compatibleWith: ['23', '36', '177'],
    mbsCategory: 'diagnostic_imaging',
    timeRequirement: 5,
    exclusionRules: []
  },
  // Mental health codes
  {
    code: '2700',
    description: 'Mental health assessment',
    confidence: 0.8,
    schedule_fee: 125.40,
    category: '1',
    reasoning: 'Specialized mental health consultation',
    conflicts: [],
    compatibleWith: [],
    mbsCategory: 'mental_health_services',
    timeRequirement: 60,
    exclusionRules: []
  }
];

describe('Enhanced Conflict Detection Engine - TDD Phase 3', () => {
  
  describe('Time Overlap Conflict Detection', () => {
    test('should detect time overlap between consultation levels', () => {
      const selectedCodes = new Set(['23']); // Level A (15 min)
      const newCode = '36'; // Level C (30 min)
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].reason).toBe('time_overlap_consultation_levels');
      expect(result.conflicts[0].severity).toBe('blocking');
      expect(result.suggestions).toContain('Choose only one consultation level per visit');
    });

    test('should allow consultation with compatible procedures within time limits', () => {
      const selectedCodes = new Set(['36']); // Level C (30 min)
      const newCode = '177'; // Wound suturing (10 min) - compatible
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(true);
      expect(result.conflicts).toHaveLength(0);
      expect(result.compatibleCodes).toContain('177');
    });

    test('should warn when total time exceeds realistic consultation duration', () => {
      const selectedCodes = new Set(['44', '177']); // Level D (45 min) + Suturing (10 min)
      const newCode = '721'; // Imaging (5 min) - Total would be 60+ min
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(true); // Allow but warn
      expect(result.warnings).toContain('Total consultation time (60+ minutes) may require additional documentation');
    });
  });

  describe('Category Exclusivity Rules', () => {
    test('should prevent multiple consultation levels in same category', () => {
      const selectedCodes = new Set(['23']); // Level A consultation
      const newCode = '44'; // Level D consultation - same category
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(false);
      expect(result.conflicts[0].reason).toBe('category_exclusive_consultation');
      expect(result.suggestions).toContain('Select only one consultation level per visit');
    });

    test('should allow different categories to be selected together', () => {
      const selectedCodes = new Set(['36']); // Professional attendance
      const newCode = '721'; // Diagnostic imaging - different category
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('Specialty Service Conflicts', () => {
    test('should prevent mixing general consultation with specialized mental health', () => {
      const selectedCodes = new Set(['36']); // General consultation
      const newCode = '2700'; // Mental health assessment
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(false);
      expect(result.conflicts[0].reason).toBe('specialty_service_conflict');
      expect(result.conflicts[0].message).toContain('Mental health services require dedicated consultation');
    });

    test('should allow mental health assessment alone', () => {
      const selectedCodes = new Set<string>();
      const newCode = '2700'; // Mental health assessment
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('Compatibility Checking', () => {
    test('should identify compatible codes for current selection', () => {
      const selectedCodes = new Set(['36']); // Level C consultation
      const newCode = '177'; // Wound suturing
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(true);
      expect(result.compatibleCodes).toContain('177');
      expect(result.compatibleCodes).toContain('721'); // Also compatible with Level C
    });

    test('should update compatible codes after selection', () => {
      const selectedCodes = new Set(['44', '177']); // Level D + suturing
      const newCode = '721'; // Imaging - should show reduced compatibility
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      // Level D + imaging may have time warnings but should be technically compatible
      expect(result.canSelect).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0); // Should have time warnings
    });
  });

  describe('Smart Suggestions System', () => {
    test('should suggest alternative codes when blocked', () => {
      const selectedCodes = new Set(['23']); // Level A consultation
      const newCode = '36'; // Level C consultation (conflicting)
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.suggestions).toContain('Choose only one consultation level per visit');
      expect(result.suggestions).toContain('Consider upgrading to Level C (36) and removing Level A (23)');
    });

    test('should suggest time-appropriate alternatives', () => {
      const selectedCodes = new Set(['44']); // Level D (45 min)
      const newCode = '2700'; // Mental health (60 min) - too long together
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.suggestions).toContain('Mental health services require dedicated consultation');
      expect(result.suggestions).toContain('Consider billing mental health assessment (2700) separately');
    });
  });

  describe('Dynamic Conflict Rule Generation', () => {
    test('should generate appropriate conflict rules for consultation codes', () => {
      const rules = generateConflictRules('36', 'professional_attendances', 30);
      
      expect(rules).toHaveLength(2);
      
      // Should generate time overlap rule
      const timeRule = rules.find(r => r.reason === 'time_overlap_consultation_levels');
      expect(timeRule).toBeDefined();
      expect(timeRule!.conflictingCodes).toContain('23');
      expect(timeRule!.conflictingCodes).toContain('44');
      
      // Should generate category exclusivity rule
      const categoryRule = rules.find(r => r.reason === 'category_exclusive_consultation');
      expect(categoryRule).toBeDefined();
      expect(categoryRule!.severity).toBe('blocking');
    });

    test('should generate specialty-specific conflict rules', () => {
      const rules = generateConflictRules('2700', 'mental_health_services', 60);
      
      const specialtyRule = rules.find(r => r.reason === 'specialty_service_conflict');
      expect(specialtyRule).toBeDefined();
      expect(specialtyRule!.conflictingCodes).toContain('23');
      expect(specialtyRule!.conflictingCodes).toContain('36');
      expect(specialtyRule!.conflictingCodes).toContain('44');
      expect(specialtyRule!.message).toContain('Mental health services require dedicated consultation');
    });

    test('should generate time-based compatibility rules', () => {
      const rules = generateConflictRules('177', 'therapeutic_procedures', 10);
      
      // Should not generate blocking conflicts for procedures
      const blockingRules = rules.filter(r => r.severity === 'blocking');
      expect(blockingRules).toHaveLength(0);
      
      // Should generate warning rules for time management
      const warningRules = rules.filter(r => r.severity === 'warning');
      expect(warningRules.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    test('should handle multiple conflicting codes gracefully', () => {
      const selectedCodes = new Set(['23', '177', '721']); // Multiple selected
      const newCode = '44'; // Would conflict with 23
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.suggestions).toContain('Consider upgrading to Level D (44) and removing Level A (23)');
    });

    test('should provide comprehensive validation summary', () => {
      const selectedCodes = new Set(['36', '177']); // Good combination
      const newCode = '721'; // Adding imaging
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(true);
      expect(result.compatibleCodes.length).toBeGreaterThan(0);
      expect(typeof result.conflicts).toBe('object');
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    test('should handle empty or invalid selections', () => {
      const selectedCodes = new Set<string>();
      const newCode = '999'; // Invalid code
      
      const result = validateComplexConflicts(selectedCodes, newCode, mockRecommendations);
      
      expect(result.canSelect).toBe(false);
      expect(result.warnings).toContain('Code not found in recommendations');
    });
  });
});