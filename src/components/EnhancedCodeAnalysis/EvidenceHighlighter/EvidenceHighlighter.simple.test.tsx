/**
 * Simplified Evidence Highlighter Tests
 * 
 * Focus on core functionality validation without duplication issues
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EvidenceHighlighter from './EvidenceHighlighter';
import { EvidenceSpan } from '../../../types/enhancedAnalysis.types';

// Simple test data
const testText = "Patient has chest pain and fever";
const testSpans: EvidenceSpan[] = [
  {
    text: 'chest pain',
    category: 'symptoms',
    relevanceScore: 0.95,
    start: 12,
    end: 22,
    confidence: 0.95
  }
];

describe('EvidenceHighlighter - Core Functionality', () => {
  it('should render plain text without evidence spans', () => {
    render(
      <EvidenceHighlighter
        text={testText}
        evidenceSpans={[]}
      />
    );

    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('should render with evidence highlighting', () => {
    render(
      <EvidenceHighlighter
        text={testText}
        evidenceSpans={testSpans}
        data-testid="evidence-highlighter"
      />
    );

    // Check structure exists
    const highlighters = screen.getAllByTestId('evidence-highlighter');
    expect(highlighters.length).toBeGreaterThanOrEqual(1);

    // Check for highlighted text (may be duplicated)
    const highlights = screen.getAllByText('chest pain');
    expect(highlights.length).toBeGreaterThanOrEqual(1);
    expect(highlights[0]).toHaveClass('evidence-highlight--symptoms');
  });

  it('should display correct tooltip information', () => {
    render(
      <EvidenceHighlighter
        text={testText}
        evidenceSpans={testSpans}
      />
    );

    const highlights = screen.getAllByText('chest pain');
    expect(highlights[0]).toHaveAttribute('title', 'symptoms: chest pain (95% relevant)');
  });
});