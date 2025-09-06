import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnhancedToolbar from './EnhancedToolbar';
import type { EnhancedCodeRecommendation } from '../../types/api.types';

function makeRec(code: string): EnhancedCodeRecommendation {
  return {
    code,
    description: `desc ${code}`,
    confidence: 0.8,
    schedule_fee: 10,
    category: '1',
    mbsCategory: 'professional_attendances',
    conflicts: [],
    compatibleWith: [],
  } as EnhancedCodeRecommendation;
}

describe('EnhancedToolbar structure', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders sections and summary with expected aria labels', () => {
    render(
      <EnhancedToolbar
        selectedCodes={['23']}
        recommendations={[makeRec('23')]}
        onBulkOperation={() => {}}
        onFilterChange={() => {}}
        onExport={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        totalSelectedFee={0}
        conflictCount={0}
      />
    );

    expect(screen.getByLabelText('Selection Summary')).toBeInTheDocument();
    expect(screen.getByLabelText('Bulk Operations')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Options')).toBeInTheDocument();
    
    // Filters are collapsed by default, check for the expand button instead
    expect(screen.getByRole('button', { name: /show filters/i })).toBeInTheDocument();
  });

  it('shows only confidence slider by default and reveals more filters when toggled', async () => {
    const user = userEvent.setup();
    
    render(
      <EnhancedToolbar
        selectedCodes={['23']}
        recommendations={[makeRec('23')]}
        onBulkOperation={() => {}}
        onFilterChange={() => {}}
        onExport={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        totalSelectedFee={0}
        conflictCount={0}
      />
    );

    // Filters are collapsed initially
    expect(screen.getByRole('button', { name: /show filters/i })).toBeInTheDocument();

    // Click to expand filters
    const showFiltersBtn = screen.getByRole('button', { name: /show filters/i });
    await user.click(showFiltersBtn);

    // Now we should see the filter controls
    expect(screen.getByLabelText('Quick Filters')).toBeInTheDocument();
    expect(screen.getByLabelText(/confidence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/min fee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max fee/i)).toBeInTheDocument();
  });
});

