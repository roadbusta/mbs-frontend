/**
 * Test suite for Export Service - Phase 4 TDD Implementation
 * 
 * These tests define the expected behavior for export functionality
 * Following TDD: Write failing tests first, then implement to make them pass
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ExportService,
  generateExportData,
  exportToCSV,
  exportToJSON,
  exportToPDF,
  exportToHTML
} from './exportService';
import {
  ExportData,
  ExportOptions,
  ExportFormat,
  EnhancedCodeRecommendation,
  SelectionState,
  MBSCategory
} from '../types/api.types';

describe('ExportService', () => {
  let mockSelectedCodes: Set<string>;
  let mockRecommendations: EnhancedCodeRecommendation[];
  let mockSelectionState: SelectionState;

  beforeEach(() => {
    mockSelectedCodes = new Set(['23', '36', '110']);
    
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
        timeRequirement: 20,
        reasoning: 'Standard consultation appropriate for this case'
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
        reasoning: 'Extended consultation for complex case'
      },
      {
        code: '110',
        description: 'ECG recording and report',
        confidence: 0.85,
        schedule_fee: 19.80,
        category: '5',
        conflicts: [],
        compatibleWith: ['23', '36'],
        mbsCategory: 'diagnostic_procedures' as MBSCategory,
        timeRequirement: 10,
        reasoning: 'Cardiac investigation indicated'
      }
    ];

    mockSelectionState = {
      selectedCodes: mockSelectedCodes,
      conflicts: new Map(),
      totalFee: 141.55,
      warnings: []
    };
  });

  describe('generateExportData', () => {
    it('should generate complete export data structure', () => {
      const consultationNote = 'Patient presents with chest pain...';
      const consultationContext = 'general_practice';
      
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        consultationNote,
        consultationContext
      );

      expect(exportData).toHaveProperty('exportDate');
      expect(exportData).toHaveProperty('selectedCodes');
      expect(exportData).toHaveProperty('summary');
      expect(exportData).toHaveProperty('conflicts');
      expect(exportData).toHaveProperty('metadata');

      expect(exportData.selectedCodes).toHaveLength(3);
      expect(exportData.selectedCodes[0]).toHaveProperty('code');
      expect(exportData.selectedCodes[0]).toHaveProperty('description');
      expect(exportData.selectedCodes[0]).toHaveProperty('scheduleFee');
      expect(exportData.selectedCodes[0]).toHaveProperty('category');

      expect(exportData.summary.totalCodes).toBe(3);
      expect(exportData.summary.totalFee).toBe(141.55);
      expect(exportData.summary.conflictCount).toBe(0);
      expect(exportData.summary.hasBlockingConflicts).toBe(false);

      expect(exportData.metadata.consultationNote).toBe(consultationNote);
      expect(exportData.metadata.consultationContext).toBe(consultationContext);
    });

    it('should include reasoning when present', () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const level23Code = exportData.selectedCodes.find(c => c.code === '23');
      expect(level23Code?.reasoning).toBe('Standard consultation appropriate for this case');
    });

    it('should include conflicts when present', () => {
      // Create a conflicted selection state
      const conflictedState: SelectionState = {
        ...mockSelectionState,
        conflicts: new Map([
          ['23', [{
            conflictingCodes: ['23', '36'],
            reason: 'category_exclusive_consultation',
            severity: 'blocking' as const,
            message: 'Cannot bill multiple consultation levels'
          }]]
        ])
      };

      const exportData = generateExportData(
        conflictedState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      expect(exportData.conflicts).toHaveLength(1);
      expect(exportData.conflicts[0]).toHaveProperty('code', '23');
      expect(exportData.conflicts[0]).toHaveProperty('conflictsWith');
      expect(exportData.conflicts[0]).toHaveProperty('reason');
      expect(exportData.conflicts[0]).toHaveProperty('severity', 'blocking');
    });
  });

  describe('exportToCSV', () => {
    it('should generate CSV content with headers', () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'csv',
        includeReasoning: true,
        includeConflicts: false,
        includeSummary: true,
        includeConsultationNote: false
      };

      const csvContent = exportToCSV(exportData, options);

      expect(csvContent).toContain('Code,Description,Fee,Category');
      expect(csvContent).toContain('23,Level A consultation,41.20,1');
      expect(csvContent).toContain('36,Level C consultation,80.55,1');
      expect(csvContent).toContain('110,ECG recording and report,19.80,5');
    });

    it('should include reasoning column when requested', () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'csv',
        includeReasoning: true,
        includeConflicts: false,
        includeSummary: false,
        includeConsultationNote: false
      };

      const csvContent = exportToCSV(exportData, options);

      expect(csvContent).toContain('Reasoning');
      expect(csvContent).toContain('Standard consultation appropriate for this case');
    });

    it('should include summary section when requested', () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'csv',
        includeReasoning: false,
        includeConflicts: false,
        includeSummary: true,
        includeConsultationNote: false
      };

      const csvContent = exportToCSV(exportData, options);

      expect(csvContent).toContain('Total Codes,3');
      expect(csvContent).toContain('Total Fee,141.55');
    });
  });

  describe('exportToJSON', () => {
    it('should generate valid JSON export', () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'json',
        includeReasoning: true,
        includeConflicts: true,
        includeSummary: true,
        includeConsultationNote: true
      };

      const jsonContent = exportToJSON(exportData, options);
      const parsed = JSON.parse(jsonContent);

      expect(parsed).toHaveProperty('selectedCodes');
      expect(parsed).toHaveProperty('summary');
      expect(parsed).toHaveProperty('exportDate');
      expect(parsed.selectedCodes).toHaveLength(3);
    });

    it('should exclude fields based on options', () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'json',
        includeReasoning: false,
        includeConflicts: false,
        includeSummary: false,
        includeConsultationNote: false
      };

      const jsonContent = exportToJSON(exportData, options);
      const parsed = JSON.parse(jsonContent);

      expect(parsed.selectedCodes[0]).not.toHaveProperty('reasoning');
      expect(parsed).not.toHaveProperty('summary');
      expect(parsed).not.toHaveProperty('conflicts');
    });
  });

  describe('exportToPDF', () => {
    it('should generate PDF content with professional formatting', async () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'pdf',
        includeReasoning: true,
        includeConflicts: true,
        includeSummary: true,
        includeConsultationNote: true,
        template: 'professional'
      };

      const pdfBlob = await exportToPDF(exportData, options);

      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(pdfBlob.type).toBe('application/pdf');
      expect(pdfBlob.size).toBeGreaterThan(0);
    });

    it('should include all sections when requested', async () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'Patient with chest pain requiring ECG',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'pdf',
        includeReasoning: true,
        includeConflicts: true,
        includeSummary: true,
        includeConsultationNote: true,
        template: 'detailed'
      };

      const pdfBlob = await exportToPDF(exportData, options);
      
      // PDF should contain all requested data
      expect(pdfBlob.size).toBeGreaterThan(1000); // Reasonable size for detailed report
    });
  });

  describe('exportToHTML', () => {
    it('should generate HTML report with proper structure', () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'html',
        includeReasoning: true,
        includeConflicts: true,
        includeSummary: true,
        includeConsultationNote: true,
        template: 'professional'
      };

      const htmlContent = exportToHTML(exportData, options);

      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html');
      expect(htmlContent).toContain('<head>');
      expect(htmlContent).toContain('<body>');
      expect(htmlContent).toContain('MBS Code Export Report');
    });

    it('should include summary table when requested', () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'html',
        includeReasoning: false,
        includeConflicts: false,
        includeSummary: true,
        includeConsultationNote: false,
        template: 'simple'
      };

      const htmlContent = exportToHTML(exportData, options);

      expect(htmlContent).toContain('<table');
      expect(htmlContent).toContain('Total Codes');
      expect(htmlContent).toContain('Total Fee');
      expect(htmlContent).toContain('141.55');
    });

    it('should include consultation note when requested', () => {
      const consultationNote = 'Patient presents with chest pain, ECG indicated';
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        consultationNote,
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'html',
        includeReasoning: false,
        includeConflicts: false,
        includeSummary: false,
        includeConsultationNote: true
      };

      const htmlContent = exportToHTML(exportData, options);

      expect(htmlContent).toContain(consultationNote);
      expect(htmlContent).toContain('Consultation Note');
    });
  });

  describe('ExportService class', () => {
    let exportService: ExportService;

    beforeEach(() => {
      exportService = new ExportService();
    });

    it('should export to file and trigger download', async () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'json',
        includeReasoning: true,
        includeConflicts: true,
        includeSummary: true,
        includeConsultationNote: true,
        filename: 'test-export'
      };

      // Mock URL.createObjectURL and document.createElement
      global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        style: { display: '' }
      };
      document.createElement = vi.fn(() => mockLink as any);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      await exportService.exportToFile(exportData, options);

      expect(mockLink.download).toContain('test-export');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should generate appropriate filename when not provided', async () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const options: ExportOptions = {
        format: 'csv',
        includeReasoning: true,
        includeConflicts: false,
        includeSummary: true,
        includeConsultationNote: false
      };

      // Mock URL.createObjectURL and document.createElement
      global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        style: { display: '' }
      };
      document.createElement = vi.fn(() => mockLink as any);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      await exportService.exportToFile(exportData, options);

      expect(mockLink.download).toMatch(/mbs-export-\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('should handle different export formats', async () => {
      const exportData = generateExportData(
        mockSelectionState,
        mockRecommendations,
        'test note',
        'general_practice'
      );

      const formats: ExportFormat[] = ['csv', 'json', 'html'];
      
      // Mock browser APIs
      global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        style: { display: '' }
      };
      document.createElement = vi.fn(() => mockLink as any);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      for (const format of formats) {
        const options: ExportOptions = {
          format,
          includeReasoning: true,
          includeConflicts: false,
          includeSummary: true,
          includeConsultationNote: false
        };

        await exportService.exportToFile(exportData, options);

        expect(mockLink.download).toContain(`.${format}`);
      }
    });
  });
});