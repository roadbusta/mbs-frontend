/**
 * Simple Enhanced Toolbar Component Test
 * 
 * A simplified test to verify basic functionality works
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnhancedToolbar from './EnhancedToolbar';

// Simple mock props
const simpleProps = {
  selectedCodes: [],
  recommendations: [],
  onBulkOperation: vi.fn(),
  onFilterChange: vi.fn(),
  onExport: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  canUndo: false,
  canRedo: false,
  totalSelectedFee: 0,
  conflictCount: 0,
};

describe('EnhancedToolbar - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<EnhancedToolbar {...simpleProps} />);
    expect(screen.getByLabelText('Enhanced Toolbar')).toBeInTheDocument();
  });

  it('has main sections', () => {
    render(<EnhancedToolbar {...simpleProps} />);
    
    expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
    expect(screen.getByText('Quick Filters')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('shows selection summary', () => {
    render(<EnhancedToolbar {...simpleProps} />);
    
    expect(screen.getByText('selected')).toBeInTheDocument();
    expect(screen.getByText('total fee')).toBeInTheDocument();
    expect(screen.getByText('conflicts')).toBeInTheDocument();
    expect(screen.getByText('total codes')).toBeInTheDocument();
  });
});