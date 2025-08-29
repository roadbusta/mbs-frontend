/**
 * Simple Tests for MBSCodeCard Selection Functionality
 * 
 * Basic tests to verify selection functionality works without complex test interactions.
 */

import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MBSCodeCard from './MBSCodeCard';
import { EnhancedCodeRecommendation, ConflictRule } from '../../types/api.types';

// Clean up after each test
afterEach(cleanup);

// Enhanced mock recommendation for testing
const mockRecommendation: EnhancedCodeRecommendation = {
  code: '36',
  description: 'Level C consultation 40+ minutes',
  confidence: 0.85,
  schedule_fee: 75.05,
  category: '1',
  reasoning: 'Patient requires detailed assessment for complex symptoms',
  
  // Enhanced selection fields
  conflicts: [{
    conflictingCodes: ['36', '44'],
    reason: 'time_overlap',
    severity: 'blocking',
    message: 'Cannot bill with Level D consultation in same visit'
  }],
  compatibleWith: ['177', '721'],
  mbsCategory: 'professional_attendances',
  timeRequirement: 40
};

describe('MBSCodeCard Basic Selection', () => {
  test('should render selection button for available state', () => {
    const onToggleSelection = vi.fn();
    
    render(
      <MBSCodeCard
        recommendation={mockRecommendation}
        rank={1}
        confidenceLevel="high"
        isSelected={false}
        selectionState="available"
        onToggleSelection={onToggleSelection}
      />
    );
    
    // Should show select button
    const selectButton = screen.getByRole('button', { name: /select/i });
    expect(selectButton).toBeInTheDocument();
    expect(selectButton).not.toBeDisabled();
    
    // Should have available styling
    const card = screen.getByTestId('mbs-code-card');
    expect(card).toHaveClass('available');
  });

  test('should render selected state with selected badge', () => {
    const onToggleSelection = vi.fn();
    
    render(
      <MBSCodeCard
        recommendation={mockRecommendation}
        rank={1}
        confidenceLevel="high"
        isSelected={true}
        selectionState="selected"
        onToggleSelection={onToggleSelection}
      />
    );
    
    // Should show selected badge
    expect(screen.getByText('SELECTED')).toBeInTheDocument();
    
    // Should show toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    expect(toggleButton).toBeInTheDocument();
    
    // Should have selected styling
    const card = screen.getByTestId('mbs-code-card');
    expect(card).toHaveClass('selected');
    expect(card).toHaveAttribute('aria-selected', 'true');
  });

  test('should render blocked state with blocked indicators', () => {
    const conflictRules: ConflictRule[] = [{
      conflictingCodes: ['36', '44'],
      reason: 'time_overlap',
      severity: 'blocking',
      message: 'Cannot bill with Level D consultation in same visit'
    }];
    
    const onToggleSelection = vi.fn();
    
    render(
      <MBSCodeCard
        recommendation={mockRecommendation}
        rank={1}
        confidenceLevel="high"
        isSelected={false}
        selectionState="blocked"
        conflicts={conflictRules}
        suggestions={['Deselect Level D consultation to enable this option']}
        onToggleSelection={onToggleSelection}
      />
    );
    
    // Should show blocked button (disabled)
    const blockedButton = screen.getByRole('button', { name: /blocked/i });
    expect(blockedButton).toBeDisabled();
    
    // Should show blocking indicator in conflict text
    const conflictIndicator = screen.getByText(/BLOCKED:.*44/);
    expect(conflictIndicator).toBeInTheDocument();
    expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
    
    // Should have blocked styling
    const card = screen.getByTestId('mbs-code-card');
    expect(card).toHaveClass('blocked');
  });

  test('should call onToggleSelection when selection button clicked', () => {
    const onToggleSelection = vi.fn();
    
    render(
      <MBSCodeCard
        recommendation={mockRecommendation}
        rank={1}
        confidenceLevel="high"
        isSelected={false}
        selectionState="available"
        onToggleSelection={onToggleSelection}
      />
    );
    
    const selectButton = screen.getByRole('button', { name: /select/i });
    fireEvent.click(selectButton);
    
    expect(onToggleSelection).toHaveBeenCalledWith('36', mockRecommendation);
  });

  test('should render compatibility indicator', () => {
    const onToggleSelection = vi.fn();
    
    render(
      <MBSCodeCard
        recommendation={mockRecommendation}
        rank={1}
        confidenceLevel="high"
        isSelected={false}
        selectionState="compatible"
        compatibleCodes={['177', '721']}
        onToggleSelection={onToggleSelection}
      />
    );
    
    // Should show compatibility indicator specifically in the compatibility section
    const compatibilityIndicator = screen.getByText('Compatible with: 177, 721');
    expect(compatibilityIndicator).toBeInTheDocument();
    
    // Should have compatible styling
    const card = screen.getByTestId('mbs-code-card');
    expect(card).toHaveClass('compatible');
  });

  test('should render conflict indicator', () => {
    const conflictRules: ConflictRule[] = [{
      conflictingCodes: ['36', '44'],
      reason: 'time_overlap',
      severity: 'warning',
      message: 'Consider time overlap with Level D consultation'
    }];
    
    render(
      <MBSCodeCard
        recommendation={mockRecommendation}
        rank={1}
        confidenceLevel="high"
        isSelected={false}
        selectionState="conflict"
        conflicts={conflictRules}
      />
    );
    
    // Should show conflict indicator
    expect(screen.getByText(/conflicts with/i)).toBeInTheDocument();
    expect(screen.getByText(conflictRules[0].message)).toBeInTheDocument();
    
    // Should have conflict styling
    const card = screen.getByTestId('mbs-code-card');
    expect(card).toHaveClass('conflict');
  });

  test('should show correct selection icons', () => {
    render(
      <MBSCodeCard
        recommendation={mockRecommendation}
        rank={1}
        confidenceLevel="high"
        isSelected={false}
        selectionState="available"
        onToggleSelection={vi.fn()}
      />
    );
    
    // Should show checkbox icon
    expect(screen.getByText('⬜')).toBeInTheDocument();
    
    // Should show select icon in button
    expect(screen.getByText('➕')).toBeInTheDocument();
  });
});