/**
 * Tests for MBSCodeCard Selection Functionality
 * 
 * Tests the enhanced MBS Code Card with selection states and conflict detection.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
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

const mockConflictingRecommendation: EnhancedCodeRecommendation = {
  ...mockRecommendation,
  code: '44',
  description: 'Level D consultation 60+ minutes',
  schedule_fee: 105.55,
  timeRequirement: 60
};

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

  describe('Selection States', () => {
    test('should render unselected state with select button', () => {
      const onToggleSelection = vi.fn();
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
          onToggleSelection={onToggleSelection}
        />
      );
      
      // Should show empty checkbox
      expect(screen.getByLabelText(/select.*36/i)).not.toBeChecked();
      
      // Should show select button
      const selectButton = screen.getByRole('button', { name: /select/i });
      expect(selectButton).toBeInTheDocument();
      expect(selectButton).not.toBeDisabled();
      
      // Should not have selected styling
      const card = screen.getByTestId('mbs-code-card');
      expect(card).not.toHaveClass('selected');
    });

    test('should render selected state with toggle button', () => {
      const onToggleSelection = vi.fn();
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={true}
          selectionState="selected"
          onToggleSelection={onToggleSelection}
        />
      );
      
      // Should show checked checkbox
      expect(screen.getByLabelText(/select.*36/i)).toBeChecked();
      
      // Should show toggle button
      const toggleButton = screen.getByRole('button', { name: /toggle|selected/i });
      expect(toggleButton).toBeInTheDocument();
      
      // Should have selected styling
      const card = screen.getByTestId('mbs-code-card');
      expect(card).toHaveClass('selected');
      
      // Should show selection badge
      expect(screen.getByText('SELECTED')).toBeInTheDocument();
    });

    test('should render compatible state with compatibility indicators', () => {
      const onToggleSelection = vi.fn();
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="compatible"
          compatibleCodes={['177', '721']}
          onToggleSelection={onToggleSelection}
        />
      );
      
      // Should show select button (enabled)
      const selectButton = screen.getByRole('button', { name: /select/i });
      expect(selectButton).toBeEnabled();
      
      // Should show compatibility indicator
      expect(screen.getByText(/compatible with/i)).toBeInTheDocument();
      expect(screen.getByText('177, 721')).toBeInTheDocument();
      
      // Should have compatible styling
      const card = screen.getByTestId('mbs-code-card');
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
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="conflict"
          conflicts={conflictRules}
          onToggleSelection={onToggleSelection}
        />
      );
      
      // Should show conflict button (still enabled for warnings)
      const conflictButton = screen.getByRole('button', { name: /conflict/i });
      expect(conflictButton).toBeEnabled();
      
      // Should show conflict indicator
      expect(screen.getByText(/conflicts with/i)).toBeInTheDocument();
      expect(screen.getByText(conflictRules[0].message)).toBeInTheDocument();
      
      // Should have conflict styling
      const card = screen.getByTestId('mbs-code-card');
      expect(card).toHaveClass('conflict');
    });

    test('should render blocked state with blocking indicators', () => {
      const conflictRules: ConflictRule[] = [{
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'blocking',
        message: 'Cannot bill with Level D consultation in same visit'
      }];
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="blocked"
          conflicts={conflictRules}
          suggestions={['Deselect Level D consultation to enable this option']}
        />
      );
      
      // Should show blocked button (disabled)
      const blockedButton = screen.getByRole('button', { name: /blocked/i });
      expect(blockedButton).toBeDisabled();
      
      // Should show blocking indicator
      expect(screen.getByText(/BLOCKED/i)).toBeInTheDocument();
      expect(screen.getByText(conflictRules[0].message)).toBeInTheDocument();
      
      // Should show suggestion
      expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      expect(screen.getByText(/deselect level d/i)).toBeInTheDocument();
      
      // Should have blocked styling
      const card = screen.getByTestId('mbs-code-card');
      expect(card).toHaveClass('blocked');
    });
  });

  describe('Selection Interactions', () => {
    test('should call onToggleSelection when select button clicked', async () => {
      const onToggleSelection = vi.fn();
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
          onToggleSelection={onToggleSelection}
        />
      );
      
      const selectButton = screen.getByRole('button', { name: /select/i });
      fireEvent.click(selectButton);
      
      expect(onToggleSelection).toHaveBeenCalledWith('36', mockRecommendation);
    });

    test('should call onToggleSelection when checkbox clicked', async () => {
      const onToggleSelection = vi.fn();
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
          onToggleSelection={onToggleSelection}
        />
      );
      
      const checkbox = screen.getByLabelText(/select.*36/i);
      fireEvent.click(checkbox);
      
      expect(onToggleSelection).toHaveBeenCalledWith('36', mockRecommendation);
    });

    test('should call onToggleSelection when selected card toggle button clicked', async () => {
      const onToggleSelection = vi.fn();
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={true}
          selectionState="selected"
          onToggleSelection={onToggleSelection}
        />
      );
      
      const toggleButton = screen.getByRole('button', { name: /toggle|selected/i });
      fireEvent.click(toggleButton);
      
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
      
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="blocked"
          conflicts={conflictRules}
          onToggleSelection={onToggleSelection}
        />
      );
      
      const blockedButton = screen.getByRole('button', { name: /blocked/i });
      fireEvent.click(blockedButton);
      
      // Button should be disabled, so no callback should be called
      expect(onToggleSelection).not.toHaveBeenCalled();
    });
  });

  describe('Visual Indicators', () => {
    test('should show correct icons for available state', () => {
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
        />
      );
      
      // Available state - empty checkbox
      expect(screen.getByLabelText(/select.*36/i)).not.toBeChecked();
    });

    test('should show correct icons for selected state', () => {
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={true}
          selectionState="selected"
        />
      );
      
      // Selected state - checked checkbox
      expect(screen.getByLabelText(/select.*36/i)).toBeChecked();
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
      render(
        <MBSCodeCard
          {...mockProps}
          selectionState="available"
        />
      );
      
      expect(screen.getByText('$75.05')).toBeInTheDocument();
      expect(screen.getByText(/schedule fee/i)).toBeInTheDocument();
    });

    test('should show compatibility and conflict information', () => {
      render(
        <MBSCodeCard
          {...mockProps}
          selectionState="compatible"
          compatibleCodes={['177', '721']}
          conflicts={[]}
        />
      );
      
      expect(screen.getByText(/compatible with/i)).toBeInTheDocument();
      expect(screen.getByText('177, 721')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels for selection controls', () => {
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={false}
          selectionState="available"
          onToggleSelection={vi.fn()}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAccessibleName(/select.*36/i);
      
      const selectButton = screen.getByRole('button', { name: /select/i });
      expect(selectButton).toHaveAccessibleDescription(/select.*level c/i);
    });

    test('should have proper ARIA states for different selection states', () => {
      render(
        <MBSCodeCard
          {...mockProps}
          isSelected={true}
          selectionState="selected"
        />
      );
      
      const card = screen.getByTestId('mbs-code-card');
      expect(card).toHaveAttribute('aria-selected', 'true');
    });

    test('should announce conflicts to screen readers', () => {
      const conflictRules: ConflictRule[] = [{
        conflictingCodes: ['36', '44'],
        reason: 'time_overlap',
        severity: 'blocking',
        message: 'Cannot bill with Level D consultation'
      }];
      
      render(
        <MBSCodeCard
          {...mockProps}
          selectionState="blocked"
          conflicts={conflictRules}
        />
      );
      
      // Should have aria-describedby for conflict information
      const card = screen.getByTestId('mbs-code-card');
      expect(card).toHaveAttribute('aria-describedby');
      
      // Should have live region for conflict announcements
      expect(screen.getByRole('status')).toHaveTextContent(/blocked/i);
    });
  });
});