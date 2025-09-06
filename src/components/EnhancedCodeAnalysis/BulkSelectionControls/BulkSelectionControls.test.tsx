/**
 * Bulk Selection Controls Component Tests
 * 
 * Test-driven development for bulk code selection functionality
 */

// import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import BulkSelectionControls from './BulkSelectionControls';
import { EnhancedCodeRecommendation } from '../../../types/enhancedAnalysis.types';

// Mock recommendations for testing
const mockRecommendations: EnhancedCodeRecommendation[] = [
  {
    code: '23',
    description: 'GP consultation',
    confidence: 0.95,
    schedule_fee: 85.00,
    evidenceSpans: [],
    detailedReasoning: {
      primaryEvidence: ['Clear symptoms'],
      supportingFactors: ['Standard presentation'],
      clinicalContext: 'Routine consultation',
      alternativesConsidered: [],
      confidenceBreakdown: {
        evidenceStrength: 0.95,
        clinicalRelevance: 0.90,
        specificityMatch: 0.95,
        historicalAccuracy: 0.88,
        weightedScore: 0.92
      }
    },
    confidenceFactors: {
      positiveFactors: [],
      negativeFactors: [],
      overallLevel: 'very_high'
    },
    feeCalculation: {
      scheduleFee: 85.00,
      gst: 8.50,
      totalFee: 93.50,
      medicareRebate: 40.00,
      patientGap: 53.50,
      bulkBillingEligible: false,
      feeNotes: []
    },
    selectionState: 'available',
    conflicts: [],
    compatibleCodes: ['24', '25']
  },
  {
    code: '24',
    description: 'Extended consultation',
    confidence: 0.82,
    schedule_fee: 120.00,
    evidenceSpans: [],
    detailedReasoning: {
      primaryEvidence: ['Extended symptoms'],
      supportingFactors: ['Complex presentation'],
      clinicalContext: 'Extended consultation',
      alternativesConsidered: [],
      confidenceBreakdown: {
        evidenceStrength: 0.82,
        clinicalRelevance: 0.85,
        specificityMatch: 0.80,
        historicalAccuracy: 0.85,
        weightedScore: 0.83
      }
    },
    confidenceFactors: {
      positiveFactors: [],
      negativeFactors: [],
      overallLevel: 'high'
    },
    feeCalculation: {
      scheduleFee: 120.00,
      gst: 12.00,
      totalFee: 132.00,
      medicareRebate: 60.00,
      patientGap: 72.00,
      bulkBillingEligible: false,
      feeNotes: []
    },
    selectionState: 'available',
    conflicts: [],
    compatibleCodes: ['23']
  },
  {
    code: '25',
    description: 'Specialist referral',
    confidence: 0.65,
    schedule_fee: 45.00,
    evidenceSpans: [],
    detailedReasoning: {
      primaryEvidence: ['Referral needed'],
      supportingFactors: ['Complex case'],
      clinicalContext: 'Specialist referral',
      alternativesConsidered: [],
      confidenceBreakdown: {
        evidenceStrength: 0.65,
        clinicalRelevance: 0.70,
        specificityMatch: 0.60,
        historicalAccuracy: 0.68,
        weightedScore: 0.66
      }
    },
    confidenceFactors: {
      positiveFactors: [],
      negativeFactors: [],
      overallLevel: 'medium'
    },
    feeCalculation: {
      scheduleFee: 200.00,
      gst: 20.00,
      totalFee: 220.00,
      medicareRebate: 100.00,
      patientGap: 120.00,
      bulkBillingEligible: false,
      feeNotes: []
    },
    selectionState: 'available',
    conflicts: [],
    compatibleCodes: []
  }
];

describe('BulkSelectionControls - TDD Implementation', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with recommendations count', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      expect(screen.getByText(/3 recommendations/)).toBeInTheDocument();
    });

    it('should display select all and deselect all buttons', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /^select all.*recommendations$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^deselect all.*recommendations$/i })).toBeInTheDocument();
    });

    it('should have correct accessibility attributes', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
          data-testid="bulk-selection-controls"
        />
      );

      const controls = screen.getByTestId('bulk-selection-controls');
      expect(controls).toHaveAttribute('role', 'toolbar');
      expect(controls).toHaveAttribute('aria-label', 'Bulk selection controls');
    });
  });

  describe('Selection Actions', () => {
    it('should call onBulkSelect with all available codes when Select All is clicked', () => {
      const onBulkSelect = vi.fn();
      
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={onBulkSelect}
          onBulkDeselect={vi.fn()}
        />
      );

      const selectAllButton = screen.getByRole('button', { name: /^select all.*recommendations$/i });
      fireEvent.click(selectAllButton);
      expect(onBulkSelect).toHaveBeenCalledWith(['23', '24', '25']);
    });

    it('should call onBulkDeselect with selected codes when Deselect All is clicked', () => {
      const onBulkDeselect = vi.fn();
      
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={['23', '24']}
          onBulkSelect={vi.fn()}
          onBulkDeselect={onBulkDeselect}
        />
      );

      const deselectAllButton = screen.getByRole('button', { name: /^deselect all.*recommendations$/i });
      fireEvent.click(deselectAllButton);
      expect(onBulkDeselect).toHaveBeenCalledWith(['23', '24']);
    });

    it('should only select available codes when Select All is clicked', () => {
      const onBulkSelect = vi.fn();
      const recommendationsWithConflicts = [
        ...mockRecommendations,
        {
          ...mockRecommendations[0],
          code: '26',
          selectionState: 'conflict' as const
        }
      ];
      
      render(
        <BulkSelectionControls
          recommendations={recommendationsWithConflicts}
          selectedCodes={[]}
          onBulkSelect={onBulkSelect}
          onBulkDeselect={vi.fn()}
        />
      );

      const selectAllButton = screen.getByRole('button', { name: /^select all.*recommendations$/i });
      fireEvent.click(selectAllButton);
      expect(onBulkSelect).toHaveBeenCalledWith(['23', '24', '25']); // Excludes conflict code
    });
  });

  describe('Confidence Level Selection', () => {
    it('should display confidence level filter buttons', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /high confidence recommendations/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /medium confidence recommendations/i })).toBeInTheDocument();
    });

    it('should select only high confidence codes when High Confidence button is clicked', () => {
      const onBulkSelect = vi.fn();
      
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={onBulkSelect}
          onBulkDeselect={vi.fn()}
        />
      );

      const highConfidenceButton = screen.getByRole('button', { name: /high confidence recommendations/i });
      fireEvent.click(highConfidenceButton);
      expect(onBulkSelect).toHaveBeenCalledWith(['23', '24']); // confidence >= 0.8
    });

    it('should show confidence level counts', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /high confidence recommendations/i })).toHaveTextContent('High Confidence (2)');
      expect(screen.getByRole('button', { name: /medium confidence recommendations/i })).toHaveTextContent('Medium Confidence (1)');
    });
  });

  describe('Selection Status Display', () => {
    it('should show selected count when codes are selected', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={['23', '24']}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      expect(screen.getByText('2 of 3 selected')).toBeInTheDocument();
    });

    it('should show "None selected" when no codes are selected', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      expect(screen.getByText('None selected')).toBeInTheDocument();
    });

    it('should show "All selected" when all codes are selected', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={['23', '24', '25']}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      expect(screen.getByText('All selected')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should disable Select All button when all codes are selected', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={['23', '24', '25']}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      const selectAllButton = screen.getByRole('button', { name: /^select all.*recommendations$/i });
      expect(selectAllButton).toBeDisabled();
    });

    it('should disable Deselect All button when no codes are selected', () => {
      render(
        <BulkSelectionControls
          recommendations={mockRecommendations}
          selectedCodes={[]}
          onBulkSelect={vi.fn()}
          onBulkDeselect={vi.fn()}
        />
      );

      const deselectAllButton = screen.getByRole('button', { name: /^deselect all.*recommendations$/i });
      expect(deselectAllButton).toBeDisabled();
    });
  });
});