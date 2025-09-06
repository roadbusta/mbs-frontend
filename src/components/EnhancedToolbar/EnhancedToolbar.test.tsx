/**
 * Enhanced Toolbar Component Tests
 * 
 * Comprehensive test suite for the Enhanced Toolbar component following TDD methodology.
 * Tests all bulk operations, quick filters, export functionality, and undo/redo controls.
 * 
 * Test Structure:
 * 1. Component Rendering Tests
 * 2. Bulk Operations Tests  
 * 3. Quick Filters Tests
 * 4. Export Functionality Tests
 * 5. Undo/Redo Controls Tests
 * 6. Keyboard Shortcuts Tests
 * 7. Accessibility Tests
 * 8. Edge Cases and Error Handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnhancedToolbar from './EnhancedToolbar';
import { EnhancedCodeRecommendation } from '../../types/api.types';

// Mock data for testing
const mockRecommendations: EnhancedCodeRecommendation[] = [
  {
    code: '23',
    description: 'Level A consultation',
    confidence: 0.85,
    reasoning: 'Standard consultation',
    schedule_fee: 41.20,
    category: '1',
    conflicts: [],
    compatibleWith: ['36'],
    mbsCategory: 'professional_attendances'
  },
  {
    code: '36',
    description: 'Level B consultation', 
    confidence: 0.92,
    reasoning: 'Extended consultation',
    schedule_fee: 79.00,
    category: '1',
    conflicts: [],
    compatibleWith: ['23'],
    mbsCategory: 'professional_attendances'
  },
  {
    code: '104',
    description: 'Professional attendance',
    confidence: 0.78,
    reasoning: 'Professional attendance',
    schedule_fee: 15.50,
    category: '2',
    conflicts: [],
    compatibleWith: ['23', '36'],
    mbsCategory: 'professional_attendances'
  }
];

const defaultProps = {
  selectedCodes: ['36'],
  recommendations: mockRecommendations,
  onBulkOperation: vi.fn(),
  onFilterChange: vi.fn(),
  onExport: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  canUndo: true,
  canRedo: false,
  totalSelectedFee: 79.00,
  conflictCount: 0,
  isLoading: false
};

describe('EnhancedToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Component Rendering Tests
   */
  describe('Component Rendering', () => {
    it('renders enhanced toolbar with all main sections', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      // Check main sections exist
      expect(screen.getByLabelText('Bulk Operations')).toBeInTheDocument();
      expect(screen.getByLabelText('Export Options')).toBeInTheDocument();
      
      // Undo/Redo buttons exist but are within the Export Options section
      expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
      
      // Filters are collapsed by default, check for the expand button
      expect(screen.getByRole('button', { name: /show filters/i })).toBeInTheDocument();
    });

    it('displays selection summary correctly', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      // Check for selection summary section
      const selectionSummary = screen.getByLabelText('Selection Summary');
      expect(selectionSummary).toBeInTheDocument();
      
      // Check individual text pieces exist
      expect(screen.getByText('selected')).toBeInTheDocument();
      expect(screen.getByText('$79.00')).toBeInTheDocument();
      expect(screen.getByText('conflicts')).toBeInTheDocument();
      expect(screen.getByText('total codes')).toBeInTheDocument();
    });

    it('updates selection summary when props change', () => {
      const { rerender } = render(<EnhancedToolbar {...defaultProps} />);
      
      rerender(
        <EnhancedToolbar 
          {...defaultProps} 
          selectedCodes={['23', '36']}
          totalSelectedFee={120.20}
          conflictCount={1}
        />
      );
      
      // Check updated values exist
      expect(screen.getByText('selected')).toBeInTheDocument();
      expect(screen.getByText('$120.20')).toBeInTheDocument();
      expect(screen.getByText('conflict')).toBeInTheDocument();
    });

    it('handles empty selection state', () => {
      render(
        <EnhancedToolbar 
          {...defaultProps} 
          selectedCodes={[]}
          totalSelectedFee={0}
        />
      );
      
      expect(screen.getByText('selected')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  /**
   * Bulk Operations Tests
   */
  describe('Bulk Operations', () => {
    it('renders all bulk operation buttons', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /select all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear selection/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /select by category/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /select compatible/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /invert selection/i })).toBeInTheDocument();
    });

    it('calls onBulkOperation when Select All is clicked', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const selectAllButton = screen.getByRole('button', { name: /select all/i });
      await user.click(selectAllButton);
      
      expect(defaultProps.onBulkOperation).toHaveBeenCalledWith('select_all');
    });

    it('calls onBulkOperation when Clear Selection is clicked', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const clearButton = screen.getByRole('button', { name: /clear selection/i });
      await user.click(clearButton);
      
      expect(defaultProps.onBulkOperation).toHaveBeenCalledWith('clear_all');
    });

    it('opens category selection dropdown', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const categoryButton = screen.getByRole('button', { name: /select by category/i });
      await user.click(categoryButton);
      
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('selects codes by category when dropdown option clicked', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const categoryButton = screen.getByRole('button', { name: /select by category/i });
      await user.click(categoryButton);
      
      const category1Option = screen.getByText('Category 1');
      await user.click(category1Option);
      
      expect(defaultProps.onBulkOperation).toHaveBeenCalledWith('select_by_category', '1');
    });

    it('calls onBulkOperation for compatible codes selection', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const compatibleButton = screen.getByRole('button', { name: /select compatible/i });
      await user.click(compatibleButton);
      
      expect(defaultProps.onBulkOperation).toHaveBeenCalledWith('select_compatible');
    });

    it('calls onBulkOperation for invert selection', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const invertButton = screen.getByRole('button', { name: /invert selection/i });
      await user.click(invertButton);
      
      expect(defaultProps.onBulkOperation).toHaveBeenCalledWith('invert_selection');
    });

    it('disables bulk operations when loading', () => {
      render(<EnhancedToolbar {...defaultProps} isLoading={true} />);
      
      expect(screen.getByRole('button', { name: /select all/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /clear selection/i })).toBeDisabled();
    });
  });

  /**
   * Quick Filters Tests
   */
  describe('Quick Filters', () => {
    it('renders all filter controls when expanded', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      // First expand the filters
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      await user.click(showFiltersButton);
      
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/min fee/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/max fee/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confidence/i)).toBeInTheDocument();
    });

    it('calls onFilterChange when category filter changes', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      // First expand the filters
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      await user.click(showFiltersButton);
      
      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, '1');
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: '1' })
      );
    });

    it('calls onFilterChange when fee range changes', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      // First expand the filters
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      await user.click(showFiltersButton);
      
      const minFeeInput = screen.getByLabelText(/min fee/i);
      await user.clear(minFeeInput);
      await user.type(minFeeInput, '50');
      
      await waitFor(() => {
        expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({ minFee: 50 })
        );
      });
    });

    it('calls onFilterChange when confidence threshold changes', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      // First expand the filters
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      await user.click(showFiltersButton);
      
      const confidenceSlider = screen.getByLabelText(/confidence/i);
      fireEvent.change(confidenceSlider, { target: { value: '0.8' } });
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ minConfidence: 0.8 })
      );
    });

    it('validates fee range input', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      // First expand the filters
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      await user.click(showFiltersButton);
      
      const minFeeInput = screen.getByLabelText(/min fee/i);
      const maxFeeInput = screen.getByLabelText(/max fee/i);
      
      await user.clear(minFeeInput);
      await user.type(minFeeInput, '100');
      await user.clear(maxFeeInput);
      await user.type(maxFeeInput, '50');
      
      expect(screen.getByText('Minimum fee cannot be greater than maximum fee')).toBeInTheDocument();
    });

    it('shows filter reset button when filters are active', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      // First expand the filters
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      await user.click(showFiltersButton);
      
      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, '1');
      
      expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument();
    });

    it('resets all filters when reset button clicked', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      // First expand the filters
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      await user.click(showFiltersButton);
      
      // Apply some filters first
      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, '1');
      
      // Reset filters
      const resetButton = screen.getByRole('button', { name: /reset filters/i });
      await user.click(resetButton);
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
        category: '',
        minFee: 0,
        maxFee: 1000,
        minConfidence: 0.6
      });
    });
  });

  /**
   * Export Functionality Tests
   */
  describe('Export Functionality', () => {
    it('renders export format selector', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      expect(screen.getByLabelText(/export format/i)).toBeInTheDocument();
    });

    it('renders export button', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /export selected/i })).toBeInTheDocument();
    });

    it('calls onExport with correct format when export button clicked', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const formatSelect = screen.getByLabelText(/export format/i);
      await user.selectOptions(formatSelect, 'pdf');
      
      const exportButton = screen.getByRole('button', { name: /export selected/i });
      await user.click(exportButton);
      
      expect(defaultProps.onExport).toHaveBeenCalledWith('pdf');
    });

    it('disables export button when no codes selected', () => {
      render(
        <EnhancedToolbar 
          {...defaultProps} 
          selectedCodes={[]}
        />
      );
      
      const exportButton = screen.getByRole('button', { name: /export selected/i });
      expect(exportButton).toBeDisabled();
    });

    it('shows export format options', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const formatSelect = screen.getByLabelText(/export format/i);
      
      // Check all format options are available
      expect(screen.getByDisplayValue('CSV')).toBeInTheDocument();
      await user.selectOptions(formatSelect, 'json');
      expect(screen.getByDisplayValue('JSON')).toBeInTheDocument();
      await user.selectOptions(formatSelect, 'html');
      expect(screen.getByDisplayValue('HTML')).toBeInTheDocument();
      await user.selectOptions(formatSelect, 'pdf');
      expect(screen.getByDisplayValue('PDF')).toBeInTheDocument();
    });

    it('shows loading state during export', () => {
      render(<EnhancedToolbar {...defaultProps} isLoading={true} />);
      
      const exportButton = screen.getByRole('button', { name: /exporting\.\.\./i });
      expect(exportButton).toBeDisabled();
    });
  });

  /**
   * Undo/Redo Controls Tests
   */
  describe('Undo/Redo Controls', () => {
    it('renders undo and redo buttons', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
    });

    it('calls onUndo when undo button clicked', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const undoButton = screen.getByRole('button', { name: /undo/i });
      await user.click(undoButton);
      
      expect(defaultProps.onUndo).toHaveBeenCalledTimes(1);
    });

    it('calls onRedo when redo button clicked', async () => {
      const user = userEvent.setup();
      render(
        <EnhancedToolbar 
          {...defaultProps} 
          canRedo={true}
        />
      );
      
      const redoButton = screen.getByRole('button', { name: /redo/i });
      await user.click(redoButton);
      
      expect(defaultProps.onRedo).toHaveBeenCalledTimes(1);
    });

    it('disables undo button when canUndo is false', () => {
      render(
        <EnhancedToolbar 
          {...defaultProps} 
          canUndo={false}
        />
      );
      
      const undoButton = screen.getByRole('button', { name: /undo/i });
      expect(undoButton).toBeDisabled();
    });

    it('disables redo button when canRedo is false', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      const redoButton = screen.getByRole('button', { name: /redo/i });
      expect(redoButton).toBeDisabled();
    });

    it('shows keyboard shortcuts in tooltips', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const undoButton = screen.getByRole('button', { name: /undo/i });
      await user.hover(undoButton);
      
      expect(screen.getByText('Ctrl+Z')).toBeInTheDocument();
    });
  });

  /**
   * Keyboard Shortcuts Tests
   */
  describe('Keyboard Shortcuts', () => {
    it('shows keyboard shortcut indicators', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      expect(screen.getByText('Ctrl+A')).toBeInTheDocument(); // Select All
      expect(screen.getByText('Delete')).toBeInTheDocument(); // Clear
      expect(screen.getByText('Ctrl+Z')).toBeInTheDocument(); // Undo
    });

    it('handles keyboard shortcuts when component has focus', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      const toolbar = screen.getByLabelText('Enhanced Toolbar');
      toolbar.focus();
      
      // Simulate Ctrl+A
      fireEvent.keyDown(toolbar, { key: 'a', ctrlKey: true });
      expect(defaultProps.onBulkOperation).toHaveBeenCalledWith('select_all');
    });
  });

  /**
   * Accessibility Tests
   */
  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      expect(screen.getByLabelText('Enhanced Toolbar')).toBeInTheDocument();
      expect(screen.getByLabelText('Bulk Operations')).toBeInTheDocument();
      expect(screen.getByLabelText('Export Options')).toBeInTheDocument();
      
      // Quick Filters only exist when expanded
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      expect(showFiltersButton).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const firstButton = screen.getByRole('button', { name: /select all/i });
      firstButton.focus();
      
      // Should be able to tab through controls
      await user.tab();
      expect(document.activeElement).not.toBe(firstButton);
    });

    it('has proper contrast and sizing', () => {
      render(<EnhancedToolbar {...defaultProps} />);
      
      const toolbar = screen.getByLabelText('Enhanced Toolbar');
      const computedStyle = window.getComputedStyle(toolbar);
      
      // Minimum touch target size check
      expect(parseInt(computedStyle.minHeight)).toBeGreaterThanOrEqual(44);
    });
  });

  /**
   * Edge Cases and Error Handling
   */
  describe('Edge Cases and Error Handling', () => {
    it('handles undefined recommendations gracefully', () => {
      render(
        <EnhancedToolbar 
          {...defaultProps} 
          recommendations={[]}
        />
      );
      
      expect(screen.getByText('total codes')).toBeInTheDocument();
    });

    it('handles very large selection counts', () => {
      const manySelectedCodes = Array.from({ length: 1000 }, (_, i) => `code${i}`);
      
      render(
        <EnhancedToolbar 
          {...defaultProps} 
          selectedCodes={manySelectedCodes}
          totalSelectedFee={50000.50}
        />
      );
      
      expect(screen.getByText('selected')).toBeInTheDocument();
      expect(screen.getByText('$50,000.50')).toBeInTheDocument();
    });

    it('handles invalid fee values gracefully', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      // First expand the filters
      const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
      await user.click(showFiltersButton);
      
      const minFeeInput = screen.getByLabelText(/min fee/i);
      await user.clear(minFeeInput);
      await user.type(minFeeInput, '-10');
      
      // Should reset to 0 or show validation error
      expect(minFeeInput).toHaveValue(0);
    });

    it('prevents double-click issues on action buttons', async () => {
      const user = userEvent.setup();
      render(<EnhancedToolbar {...defaultProps} />);
      
      const selectAllButton = screen.getByRole('button', { name: /select all/i });
      
      // Double click rapidly
      await user.dblClick(selectAllButton);
      
      // Should only be called once due to debouncing
      expect(defaultProps.onBulkOperation).toHaveBeenCalledTimes(1);
    });

    it('maintains component state during prop updates', () => {
      const { rerender } = render(<EnhancedToolbar {...defaultProps} />);
      
      // Component should maintain its internal state
      const categorySelect = screen.getByLabelText(/filter by category/i);
      fireEvent.change(categorySelect, { target: { value: '1' } });
      
      // Rerender with new props
      rerender(
        <EnhancedToolbar 
          {...defaultProps} 
          selectedCodes={['23', '36']}
        />
      );
      
      // Filter state should be preserved
      expect(categorySelect).toHaveValue('1');
    });
  });
});