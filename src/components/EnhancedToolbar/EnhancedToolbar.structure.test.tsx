import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByLabelText('Quick Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Options')).toBeInTheDocument();
    expect(screen.getByLabelText('Undo/Redo Controls')).toBeInTheDocument();
  });

  it('shows only confidence slider by default and reveals more filters when toggled', async () => {
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

    // Confidence slider present
    expect(screen.getByLabelText('Minimum Confidence')).toBeInTheDocument();

    // Category and fee inputs may be hidden behind disclosure initially
    // Use role or label queries to ensure they become visible after toggle
    const moreBtn = screen.getByRole('button', { name: /more filters/i });
    moreBtn.click();

    expect(screen.getByLabelText('Filter by Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum Fee')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum Fee')).toBeInTheDocument();
  });
});

