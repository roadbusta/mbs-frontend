/**
 * Tests for MBSCodeCard Selection Functionality
 * 
 * Tests the enhanced MBS Code Card with selection states and conflict detection.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MBSCodeCard from './MBSCodeCard';
import { EnhancedCodeRecommendation, ConflictRule } from '../../types/api.types';

// Enhanced mock recommendation for testing
const mockRecommendation: EnhancedCodeRecommendation = {
  code: '36',
  description: 'Level C consultation 40+ minutes',
  confidence: 0.85,
  schedule_fee: 75.05,
  category: '1',
  reasoning: 'Patient requires detailed assessment for complex symptoms',
  evidence_spans: [
    { start: 0, end: 20, text: 'persistent cough symptoms', relevance: 0.9 }
  ],
  
  // Enhanced selection fields
  conflicts: [{
    conflictingCodes: ['36', '44'],
    reason: 'time_overlap',
    severity: 'blocking',
    message: 'Cannot bill with Level D consultation in same visit'
  }],
  compatibleWith: ['177', '721'],
  mbsCategory: 'professional_attendances',
  timeRequirement: 40,
  exclusionRules: [{
    excludedCodes: ['23'],
    reason: 'Brief consultation conflicts with extended consultation',
    conditions: ['same_day']
  }]
};

// Unused mock - keeping for potential future use
// const mockConflictingRecommendation: EnhancedCodeRecommendation = {
//   ...mockRecommendation,
//   code: '44',
//   description: 'Level D consultation 60+ minutes',
//   schedule_fee: 105.55,
//   timeRequirement: 60
// };

// Mock props for testing different states
const mockProps = {
  recommendation: mockRecommendation,
  rank: 1,
  confidenceLevel: 'high' as const,
  onFeedbackSubmit: vi.fn(),
  onSuggestionSubmit: vi.fn(),
};

describe('MBSCodeCard Selection Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });

  describe('Selection States', () => {
    test('should render unselected state with select button', () => {
      const onToggleSelection = vi.fn();
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
          onToggleSelection={onToggleSelection}
        />
      );
      
      // Should show empty checkbox - use container to scope to this render
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).not.toBeChecked();
      expect(checkbox).toHaveAttribute('aria-label', 'Select MBS code 36');
      
      // Should show select button
      const selectButton = container.querySelector('button.selection-button');
      expect(selectButton).toBeInTheDocument();
      expect(selectButton).not.toBeDisabled();
      expect(selectButton).toHaveTextContent('Select');
      
      // Should not have selected styling
      const card = container.querySelector('[data-testid="mbs-code-card"]');
      expect(card).not.toHaveClass('selected');
    });

    test('should render selected state with toggle button', () => {
      const onToggleSelection = vi.fn();
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={true}
          selectionState="selected"
          onToggleSelection={onToggleSelection}
        />
      );
      
      // Should show checked checkbox - use container to scope to this render
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeChecked();
      expect(checkbox).toHaveAttribute('aria-label', 'Select MBS code 36');
      
      // Should show toggle button
      const toggleButton = container.querySelector('button.selection-button');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('Toggle');
      
      // Should have selected styling
      const card = container.querySelector('[data-testid="mbs-code-card"]');
      expect(card).toHaveClass('selected');
      
      // Should show selection badge
      expect(container).toHaveTextContent('SELECTED');
    });

    test('should render compatible state with compatibility indicators', () => {
      const onToggleSelection = vi.fn();
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="compatible"
          compatibleCodes={['177', '721']}
          onToggleSelection={onToggleSelection}
        />
      );
      
      // Should show select button (enabled)
      const selectButton = container.querySelector('button.selection-button');
      expect(selectButton).toBeEnabled();
      expect(selectButton).toHaveTextContent('Select');
      
      // Should show compatibility indicator
      expect(container).toHaveTextContent(/compatible with/i);
      expect(container).toHaveTextContent('177, 721');
      
      // Should have compatible styling
      const card = container.querySelector('[data-testid="mbs-code-card"]');
      expect(card).toHaveClass('compatible');
    });

    test('should render conflict state with warning indicators', () => {
      const conflictRules: ConflictRule[] = [{
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'warning',
        message: 'Consider time overlap with Level D consultation'
      }];
      
      const onToggleSelection = vi.fn();
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="conflict"
          conflicts={conflictRules}
          onToggleSelection={onToggleSelection}
        />
      );
      
      // Should show conflict button (still enabled for warnings)
      const conflictButton = container.querySelector('button.selection-button');
      expect(conflictButton).toBeEnabled();
      expect(conflictButton).toHaveTextContent('Conflict');
      
      // Should show conflict indicator
      expect(container).toHaveTextContent(/conflicts with/i);
      expect(container).toHaveTextContent(conflictRules[0].message);
      
      // Should have conflict styling
      const card = container.querySelector('[data-testid="mbs-code-card"]');
      expect(card).toHaveClass('conflict');
    });

    test('should render blocked state with blocking indicators', () => {
      const conflictRules: ConflictRule[] = [{
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'blocking',
        message: 'Cannot bill with Level D consultation in same visit'
      }];
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="blocked"
          conflicts={conflictRules}
          suggestions={['Deselect Level D consultation to enable this option']}
        />
      );
      
      // Should show blocked button (disabled)
      const blockedButton = container.querySelector('button.selection-button');
      expect(blockedButton).toBeInTheDocument();
      expect(blockedButton!).toBeDisabled();
      expect(blockedButton).toHaveTextContent('Blocked');
      
      // Should show blocking indicator
      expect(container).toHaveTextContent(/BLOCKED/i);
      expect(container).toHaveTextContent(conflictRules[0].message);
      
      // Should show suggestion
      expect(container).toHaveTextContent(/suggestion/i);
      expect(container).toHaveTextContent(/deselect level d/i);
      
      // Should have blocked styling
      const card = container.querySelector('[data-testid="mbs-code-card"]');
      expect(card).toHaveClass('blocked');
    });
  });

  describe('Selection Interactions', () => {
    test('should call onToggleSelection when select button clicked', async () => {
      const onToggleSelection = vi.fn();
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
          onToggleSelection={onToggleSelection}
        />
      );
      
      const selectButton = container.querySelector('button.selection-button');
      expect(selectButton).toBeInTheDocument();
      fireEvent.click(selectButton!);
      
      expect(onToggleSelection).toHaveBeenCalledWith('36', mockRecommendation);
    });

    test('should call onToggleSelection when checkbox clicked', async () => {
      const onToggleSelection = vi.fn();
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
          onToggleSelection={onToggleSelection}
        />
      );
      
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      
      // Simulate the change event that would trigger the handler
      fireEvent.change(checkbox!, { target: { checked: true } });
      
      expect(onToggleSelection).toHaveBeenCalledWith('36', mockRecommendation);
    });

    test('should call onToggleSelection when selected card toggle button clicked', async () => {
      const onToggleSelection = vi.fn();
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={true}
          selectionState="selected"
          onToggleSelection={onToggleSelection}
        />
      );
      
      const toggleButton = container.querySelector('button.selection-button');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('Toggle');
      fireEvent.click(toggleButton!);
      
      expect(onToggleSelection).toHaveBeenCalledWith('36', mockRecommendation);
    });

    test('should not call onToggleSelection when blocked button clicked', () => {
      const onToggleSelection = vi.fn();
      const conflictRules: ConflictRule[] = [{
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'blocking',
        message: 'Cannot bill with Level D consultation'
      }];
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="blocked"
          conflicts={conflictRules}
          onToggleSelection={onToggleSelection}
        />
      );
      
      const blockedButton = container.querySelector('button.selection-button');
      expect(blockedButton).toBeDisabled();
      fireEvent.click(blockedButton!);
      
      // Button should be disabled, so no callback should be called
      expect(onToggleSelection).not.toHaveBeenCalled();
    });
  });

  describe('Visual Indicators', () => {
    test('should show correct icons for available state', () => {
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
        />
      );
      
      // Available state - empty checkbox
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox!).not.toBeChecked();
    });

    test('should show correct icons for selected state', () => {
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={true}
          selectionState="selected"
        />
      );
      
      // Selected state - checked checkbox
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox!).toBeChecked();
    });

    test('should show correct icons for blocked state', () => {
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="blocked"
          conflicts={[{
            conflictingCodes: ['36', '44'],
            reason: 'time_overlap',
            severity: 'blocking',
            message: 'Blocked by conflict'
          }]}
        />
      );
      
      // Blocked state - blocked icon
      expect(screen.getByText('🚫')).toBeInTheDocument();
    });

    test('should show fee information prominently', () => {
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          selectionState="available"
        />
      );
      
      expect(container).toHaveTextContent('$75.05');
      expect(container).toHaveTextContent(/schedule fee/i);
    });

    test('should show compatibility and conflict information', () => {
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          selectionState="compatible"
          compatibleCodes={['177', '721']}
          conflicts={[]}
        />
      );
      
      expect(container).toHaveTextContent(/compatible with/i);
      expect(container).toHaveTextContent('177, 721');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels for selection controls', () => {
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
          onToggleSelection={vi.fn()}
        />
      );
      
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute('aria-label', 'Select MBS code 36');
      
      const selectButton = container.querySelector('button.selection-button');
      expect(selectButton).toHaveTextContent('Select');
    });

    test('should have proper ARIA states for different selection states', () => {
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          isSelected={true}
          selectionState="selected"
        />
      );
      
      const card = container.querySelector('[data-testid="mbs-code-card"]');
      expect(card).toHaveAttribute('aria-selected', 'true');
    });

    test('should announce conflicts to screen readers', () => {
      const conflictRules: ConflictRule[] = [{
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'blocking',
        message: 'Cannot bill with Level D consultation'
      }];
      
      const { container } = render(
        <MBSCodeCard
          {...mockProps}
          selectionState="blocked"
          conflicts={conflictRules}
        />
      );
      
      // Should have aria-describedby for conflict information
      const card = container.querySelector('[data-testid="mbs-code-card"]');
      expect(card).toHaveAttribute('aria-describedby');
      
      // Should have live region for conflict announcements
      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toHaveTextContent(/blocked/i);
    });
  });
});