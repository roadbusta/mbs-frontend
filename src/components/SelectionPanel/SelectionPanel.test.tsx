/**
 * Selection Management Panel Tests
 * 
 * Comprehensive test suite for the Selection Panel component following TDD methodology.
 * Tests selection summary, preset management, optimization suggestions, and selection comparison.
 * 
 * Test Structure:
 * 1. Component Rendering Tests
 * 2. Selection Summary Tests
 * 3. Preset Management Tests
 * 4. Optimization Suggestions Tests
 * 5. Selection Comparison Tests
 * 6. Selection History Tests
 * 7. Accessibility Tests
 * 8. Edge Cases and Error Handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectionPanel from './SelectionPanel';
import { SelectionState, SelectionPreset, OptimizationSuggestion, SelectionHistoryEntry } from '../../types/api.types';

// Mock data for testing
const mockSelectionState: SelectionState = {
  selectedCodes: new Set(['23', '36']),
  conflicts: [],
  warnings: ['Time management warning'],
  totalFee: 120.20,
  isValid: true
};

const mockPresets: SelectionPreset[] = [
  {
    id: 'preset-1',
    name: 'Standard GP Visit',
    description: 'Common codes for standard GP consultation',
    selectedCodes: ['23', '36'],
    createdAt: '2024-01-15T10:30:00Z',
    modifiedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'preset-2',
    name: 'Extended Consultation',
    description: 'Codes for extended patient consultations',
    selectedCodes: ['44', '104'],
    createdAt: '2024-01-10T14:20:00Z',
    modifiedAt: '2024-01-12T16:45:00Z'
  }
];

const mockOptimizationSuggestions: OptimizationSuggestion[] = [
  {
    type: 'maximize_fee',
    currentFee: 120.20,
    suggestedFee: 135.80,
    improvement: 15.60,
    changes: [
      {
        action: 'replace',
        code: '23',
        description: 'Replace Level A with Level C consultation',
        reason: 'Higher fee for similar service complexity'
      }
    ],
    confidence: 0.85
  },
  {
    type: 'add_compatible',
    currentFee: 120.20,
    suggestedFee: 145.70,
    improvement: 25.50,
    changes: [
      {
        action: 'add',
        code: '104',
        description: 'Add compatible professional attendance',
        reason: 'Can be billed concurrently without conflicts'
      }
    ],
    confidence: 0.92
  }
];

const mockSelectionHistory: SelectionHistoryEntry[] = [
  {
    id: 'history-1',
    action: 'select',
    code: '23',
    selectionState: {
      selectedCodes: ['23'],
      totalFee: 41.20
    },
    timestamp: '2024-01-20T10:30:00Z'
  },
  {
    id: 'history-2',
    action: 'select',
    code: '36',
    selectionState: {
      selectedCodes: ['23', '36'],
      totalFee: 120.20
    },
    timestamp: '2024-01-20T10:32:00Z'
  }
];

const defaultProps = {
  selectionState: mockSelectionState,
  presets: mockPresets,
  optimizationSuggestions: mockOptimizationSuggestions,
  selectionHistory: mockSelectionHistory,
  onPresetSave: vi.fn(),
  onPresetLoad: vi.fn(),
  onPresetDelete: vi.fn(),
  onOptimizationApply: vi.fn(),
  onSelectionRevert: vi.fn(),
  onComparisonStart: vi.fn(),
  isComparisonMode: false,
  comparisonSelection: null,
  isLoading: false
};

describe('SelectionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Component Rendering Tests
   */
  describe('Component Rendering', () => {
    it('renders selection panel with all main sections', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      expect(screen.getByLabelText('Selection Management Panel')).toBeInTheDocument();
      expect(screen.getByText('Selection Summary')).toBeInTheDocument();
      expect(screen.getByText('Saved Presets')).toBeInTheDocument();
      expect(screen.getByText('Optimization Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Selection History')).toBeInTheDocument();
    });

    it('renders collapsed by default on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<SelectionPanel {...defaultProps} />);
      
      const panel = screen.getByLabelText('Selection Management Panel');
      expect(panel).toHaveClass('selection-panel-collapsed');
    });

    it('renders expanded by default on desktop', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<SelectionPanel {...defaultProps} />);
      
      const panel = screen.getByLabelText('Selection Management Panel');
      expect(panel).not.toHaveClass('selection-panel-collapsed');
    });

    it('shows loading state correctly', () => {
      render(<SelectionPanel {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Loading selection data...')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading selection panel')).toBeInTheDocument();
    });
  });

  /**
   * Selection Summary Tests
   */
  describe('Selection Summary', () => {
    it('displays current selection summary', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      expect(screen.getByText('2 codes selected')).toBeInTheDocument();
      expect(screen.getByText('$120.20')).toBeInTheDocument();
      expect(screen.getByText('No conflicts')).toBeInTheDocument();
      expect(screen.getByText('1 warning')).toBeInTheDocument();
    });

    it('handles empty selection state', () => {
      const emptySelectionState = {
        selectedCodes: new Set<string>(),
        conflicts: [],
        warnings: [],
        totalFee: 0,
        isValid: true
      };

      render(
        <SelectionPanel 
          {...defaultProps} 
          selectionState={emptySelectionState}
        />
      );
      
      expect(screen.getByText('No codes selected')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('displays conflicts when present', () => {
      const conflictSelectionState = {
        ...mockSelectionState,
        conflicts: [
          {
            conflictingCodes: ['23', '36'],
            reason: 'time_overlap',
            severity: 'blocking' as const,
            message: 'Cannot bill multiple consultation levels'
          }
        ],
        isValid: false
      };

      render(
        <SelectionPanel 
          {...defaultProps} 
          selectionState={conflictSelectionState}
        />
      );
      
      expect(screen.getByText('1 conflict')).toBeInTheDocument();
      expect(screen.getByText('Selection has conflicts')).toBeInTheDocument();
    });

    it('shows detailed selection breakdown', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      // Click to expand details
      const detailsButton = screen.getByRole('button', { name: /view details/i });
      fireEvent.click(detailsButton);
      
      expect(screen.getByText('Selected Codes:')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('36')).toBeInTheDocument();
    });

    it('calculates fee totals correctly', () => {
      const largeSelection = {
        selectedCodes: new Set(['23', '36', '44', '104']),
        conflicts: [],
        warnings: [],
        totalFee: 256.80,
        isValid: true
      };

      render(
        <SelectionPanel 
          {...defaultProps} 
          selectionState={largeSelection}
        />
      );
      
      expect(screen.getByText('4 codes selected')).toBeInTheDocument();
      expect(screen.getByText('$256.80')).toBeInTheDocument();
    });
  });

  /**
   * Preset Management Tests
   */
  describe('Preset Management', () => {
    it('displays saved presets list', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      expect(screen.getByText('Standard GP Visit')).toBeInTheDocument();
      expect(screen.getByText('Extended Consultation')).toBeInTheDocument();
    });

    it('shows preset details on hover', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const preset = screen.getByText('Standard GP Visit');
      await user.hover(preset);
      
      expect(screen.getByText('Common codes for standard GP consultation')).toBeInTheDocument();
      expect(screen.getByText('2 codes')).toBeInTheDocument();
    });

    it('loads preset when clicked', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const loadButton = screen.getAllByRole('button', { name: /load preset/i })[0];
      await user.click(loadButton);
      
      expect(defaultProps.onPresetLoad).toHaveBeenCalledWith('preset-1');
    });

    it('shows save preset dialog', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /save as preset/i });
      await user.click(saveButton);
      
      expect(screen.getByText('Save Selection as Preset')).toBeInTheDocument();
      expect(screen.getByLabelText(/preset name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('validates preset name input', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /save as preset/i });
      await user.click(saveButton);
      
      const savePresetButton = screen.getByRole('button', { name: /save preset/i });
      await user.click(savePresetButton);
      
      expect(screen.getByText('Preset name is required')).toBeInTheDocument();
    });

    it('saves preset with valid input', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      // Open save dialog
      const saveButton = screen.getByRole('button', { name: /save as preset/i });
      await user.click(saveButton);
      
      // Fill in preset details
      const nameInput = screen.getByLabelText(/preset name/i);
      const descInput = screen.getByLabelText(/description/i);
      
      await user.type(nameInput, 'My Custom Preset');
      await user.type(descInput, 'Custom preset for specific cases');
      
      // Save preset
      const savePresetButton = screen.getByRole('button', { name: /save preset/i });
      await user.click(savePresetButton);
      
      expect(defaultProps.onPresetSave).toHaveBeenCalledWith({
        name: 'My Custom Preset',
        description: 'Custom preset for specific cases'
      });
    });

    it('deletes preset with confirmation', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete preset/i });
      await user.click(deleteButtons[0]);
      
      // Confirm deletion
      expect(screen.getByText('Delete Preset?')).toBeInTheDocument();
      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      await user.click(confirmButton);
      
      expect(defaultProps.onPresetDelete).toHaveBeenCalledWith('preset-1');
    });

    it('handles empty presets list', () => {
      render(<SelectionPanel {...defaultProps} presets={[]} />);
      
      expect(screen.getByText('No saved presets')).toBeInTheDocument();
      expect(screen.getByText('Save your first preset to get started')).toBeInTheDocument();
    });
  });

  /**
   * Optimization Suggestions Tests
   */
  describe('Optimization Suggestions', () => {
    it('displays optimization suggestions', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      expect(screen.getByText('Maximize Fee')).toBeInTheDocument();
      expect(screen.getByText('Add Compatible Codes')).toBeInTheDocument();
      expect(screen.getByText('+$15.60')).toBeInTheDocument();
      expect(screen.getByText('+$25.50')).toBeInTheDocument();
    });

    it('shows suggestion details', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const suggestion = screen.getByText('Maximize Fee');
      await user.click(suggestion);
      
      expect(screen.getByText('Replace Level A with Level C consultation')).toBeInTheDocument();
      expect(screen.getByText('Higher fee for similar service complexity')).toBeInTheDocument();
      expect(screen.getByText('85% confidence')).toBeInTheDocument();
    });

    it('applies optimization suggestion', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const applyButtons = screen.getAllByRole('button', { name: /apply optimization/i });
      await user.click(applyButtons[0]);
      
      expect(defaultProps.onOptimizationApply).toHaveBeenCalledWith(mockOptimizationSuggestions[0]);
    });

    it('shows confirmation for high-impact changes', async () => {
      const user = userEvent.setup();
      const highImpactSuggestion = {
        ...mockOptimizationSuggestions[0],
        improvement: 50.00,
        changes: [
          {
            action: 'replace' as const,
            code: '23',
            description: 'Major change with high impact',
            reason: 'Significant fee increase'
          }
        ]
      };

      render(
        <SelectionPanel 
          {...defaultProps} 
          optimizationSuggestions={[highImpactSuggestion]}
        />
      );
      
      const applyButton = screen.getByRole('button', { name: /apply optimization/i });
      await user.click(applyButton);
      
      expect(screen.getByText('Confirm Major Change')).toBeInTheDocument();
      expect(screen.getByText('This will increase your fee by $50.00')).toBeInTheDocument();
    });

    it('handles no optimization suggestions', () => {
      render(<SelectionPanel {...defaultProps} optimizationSuggestions={[]} />);
      
      expect(screen.getByText('No optimization suggestions available')).toBeInTheDocument();
      expect(screen.getByText('Your selection is already optimized')).toBeInTheDocument();
    });

    it('filters suggestions by confidence threshold', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      // Open confidence filter
      const filterButton = screen.getByRole('button', { name: /filter by confidence/i });
      await user.click(filterButton);
      
      // Set high confidence threshold
      const slider = screen.getByLabelText(/minimum confidence/i);
      fireEvent.change(slider, { target: { value: '0.9' } });
      
      // Should only show high-confidence suggestions
      expect(screen.queryByText('Maximize Fee')).not.toBeInTheDocument();
      expect(screen.getByText('Add Compatible Codes')).toBeInTheDocument();
    });
  });

  /**
   * Selection Comparison Tests
   */
  describe('Selection Comparison', () => {
    it('starts comparison mode', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const compareButton = screen.getByRole('button', { name: /compare selections/i });
      await user.click(compareButton);
      
      expect(defaultProps.onComparisonStart).toHaveBeenCalled();
    });

    it('displays comparison when in comparison mode', () => {
      const comparisonSelection = {
        selectedCodes: new Set(['44', '104']),
        conflicts: [],
        warnings: [],
        totalFee: 156.50,
        isValid: true
      };

      render(
        <SelectionPanel 
          {...defaultProps} 
          isComparisonMode={true}
          comparisonSelection={comparisonSelection}
        />
      );
      
      expect(screen.getByText('Selection Comparison')).toBeInTheDocument();
      expect(screen.getByText('Current Selection')).toBeInTheDocument();
      expect(screen.getByText('Comparison Selection')).toBeInTheDocument();
      expect(screen.getByText('$120.20')).toBeInTheDocument();
      expect(screen.getByText('$156.50')).toBeInTheDocument();
    });

    it('shows comparison differences', () => {
      const comparisonSelection = {
        selectedCodes: new Set(['44', '104']),
        conflicts: [],
        warnings: [],
        totalFee: 156.50,
        isValid: true
      };

      render(
        <SelectionPanel 
          {...defaultProps} 
          isComparisonMode={true}
          comparisonSelection={comparisonSelection}
        />
      );
      
      expect(screen.getByText('+$36.30')).toBeInTheDocument();
      expect(screen.getByText('Fee difference')).toBeInTheDocument();
    });

    it('highlights unique codes in comparison', () => {
      const comparisonSelection = {
        selectedCodes: new Set(['23', '44']), // 23 is common, 44 is unique
        conflicts: [],
        warnings: [],
        totalFee: 135.60,
        isValid: true
      };

      render(
        <SelectionPanel 
          {...defaultProps} 
          isComparisonMode={true}
          comparisonSelection={comparisonSelection}
        />
      );
      
      // Should show unique codes
      expect(screen.getByText('Unique to current:')).toBeInTheDocument();
      expect(screen.getByText('Unique to comparison:')).toBeInTheDocument();
    });
  });

  /**
   * Selection History Tests
   */
  describe('Selection History', () => {
    it('displays selection history entries', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      expect(screen.getByText('Selected code 23')).toBeInTheDocument();
      expect(screen.getByText('Selected code 36')).toBeInTheDocument();
    });

    it('formats timestamps correctly', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      // Should show relative time or formatted date
      expect(screen.getByText(/Jan 20/)).toBeInTheDocument();
    });

    it('allows reverting to previous selection', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const revertButtons = screen.getAllByRole('button', { name: /revert to this selection/i });
      await user.click(revertButtons[0]);
      
      expect(defaultProps.onSelectionRevert).toHaveBeenCalledWith('history-1');
    });

    it('shows confirmation for revert action', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const revertButtons = screen.getAllByRole('button', { name: /revert to this selection/i });
      await user.click(revertButtons[1]);
      
      expect(screen.getByText('Revert Selection?')).toBeInTheDocument();
      expect(screen.getByText('This will replace your current selection')).toBeInTheDocument();
    });

    it('handles empty history', () => {
      render(<SelectionPanel {...defaultProps} selectionHistory={[]} />);
      
      expect(screen.getByText('No selection history')).toBeInTheDocument();
    });

    it('limits history display to recent entries', () => {
      const longHistory = Array.from({ length: 20 }, (_, i) => ({
        id: `history-${i}`,
        action: 'select' as const,
        code: `${i + 20}`,
        selectionState: {
          selectedCodes: [`${i + 20}`],
          totalFee: (i + 1) * 10
        },
        timestamp: new Date(Date.now() - i * 60000).toISOString()
      }));

      render(<SelectionPanel {...defaultProps} selectionHistory={longHistory} />);
      
      // Should show "Show more" button for long history
      expect(screen.getByRole('button', { name: /show more history/i })).toBeInTheDocument();
    });
  });

  /**
   * Accessibility Tests
   */
  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      expect(screen.getByLabelText('Selection Management Panel')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /selection summary/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /saved presets/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /optimization suggestions/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const firstButton = screen.getByRole('button', { name: /save as preset/i });
      firstButton.focus();
      
      // Should be able to navigate through interactive elements
      await user.tab();
      expect(document.activeElement).not.toBe(firstButton);
    });

    it('provides screen reader friendly content', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      // Check for screen reader specific content
      expect(screen.getByText('2 codes selected')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByLabelText(/total fee for selected codes/i)).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<SelectionPanel {...defaultProps} />);
      
      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.slice(1));
        expect(level).toBeGreaterThanOrEqual(2);
        expect(level).toBeLessThanOrEqual(4);
      });
    });
  });

  /**
   * Edge Cases and Error Handling
   */
  describe('Edge Cases and Error Handling', () => {
    it('handles invalid selection state gracefully', () => {
      const invalidState = {
        selectedCodes: new Set(['invalid-code']),
        conflicts: [],
        warnings: [],
        totalFee: NaN,
        isValid: false
      };

      render(<SelectionPanel {...defaultProps} selectionState={invalidState} />);
      
      expect(screen.getByText('Selection has errors')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument(); // Should handle NaN gracefully
    });

    it('handles preset loading errors', async () => {
      const user = userEvent.setup();
      const mockOnPresetLoad = vi.fn().mockRejectedValue(new Error('Load failed'));
      
      render(<SelectionPanel {...defaultProps} onPresetLoad={mockOnPresetLoad} />);
      
      const loadButton = screen.getAllByRole('button', { name: /load preset/i })[0];
      await user.click(loadButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load preset')).toBeInTheDocument();
      });
    });

    it('handles optimization apply errors', async () => {
      const user = userEvent.setup();
      const mockOnOptimizationApply = vi.fn().mockRejectedValue(new Error('Apply failed'));
      
      render(<SelectionPanel {...defaultProps} onOptimizationApply={mockOnOptimizationApply} />);
      
      const applyButton = screen.getAllByRole('button', { name: /apply optimization/i })[0];
      await user.click(applyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to apply optimization')).toBeInTheDocument();
      });
    });

    it('maintains state during prop updates', () => {
      const { rerender } = render(<SelectionPanel {...defaultProps} />);
      
      // Open a section
      const detailsButton = screen.getByRole('button', { name: /view details/i });
      fireEvent.click(detailsButton);
      
      // Update props
      rerender(<SelectionPanel {...defaultProps} isLoading={true} />);
      
      // Details should still be open
      expect(screen.getByText('Selected Codes:')).toBeInTheDocument();
    });

    it('handles very large selections efficiently', () => {
      const largeSelection = {
        selectedCodes: new Set(Array.from({ length: 100 }, (_, i) => `code-${i}`)),
        conflicts: [],
        warnings: [],
        totalFee: 5000.00,
        isValid: true
      };

      render(<SelectionPanel {...defaultProps} selectionState={largeSelection} />);
      
      expect(screen.getByText('100 codes selected')).toBeInTheDocument();
      expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    });

    it('prevents double-click issues on action buttons', async () => {
      const user = userEvent.setup();
      render(<SelectionPanel {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /save as preset/i });
      
      // Double click rapidly
      await user.dblClick(saveButton);
      
      // Should only open dialog once
      expect(screen.getAllByText('Save Selection as Preset')).toHaveLength(1);
    });
  });
});