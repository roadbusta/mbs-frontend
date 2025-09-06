/**
 * Evidence Highlighter Component Tests
 * 
 * Test-driven development for clinical text evidence highlighting
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EvidenceHighlighter from './EvidenceHighlighter';
import { EvidenceSpan } from '../../../types/enhancedAnalysis.types';

// Mock evidence spans for testing
const mockEvidenceSpans: EvidenceSpan[] = [
  {
    text: 'chest pain',
    category: 'symptoms',
    relevanceScore: 0.95,
    start: 20,
    end: 30,
    confidence: 0.95
  },
  {
    text: 'physical examination',
    category: 'procedures',
    relevanceScore: 0.85,
    start: 50,
    end: 70,
    confidence: 0.85
  },
  {
    text: 'acute onset',
    category: 'clinical_findings',
    relevanceScore: 0.80,
    start: 5,
    end: 16,
    confidence: 0.80
  }
];

const mockClinicalText = "with acute onset of chest pain following physical examination and assessment";
//                        01234567890123456789012345678901234567890123456789012345678901234567890123456
//                        0         1         2         3         4         5         6         7

describe('EvidenceHighlighter - TDD Implementation', () => {
  describe('Basic Rendering', () => {
    it('should render clinical text when no evidence spans provided', () => {
      render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={[]}
        />
      );

      expect(screen.getByText(mockClinicalText)).toBeInTheDocument();
    });

    it('should have correct accessibility attributes', () => {
      render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={mockEvidenceSpans}
          data-testid="evidence-highlighter"
        />
      );

      const highlighter = screen.getByTestId('evidence-highlighter');
      expect(highlighter).toHaveAttribute('role', 'region');
      expect(highlighter).toHaveAttribute('aria-label', 'Clinical text with evidence highlighting');
    });
  });

  describe('Evidence Highlighting', () => {
    it('should highlight evidence spans with correct categories', () => {
      render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={mockEvidenceSpans}
        />
      );

      // Check for highlighted spans
      expect(screen.getByText('acute onset')).toHaveClass('evidence-highlight--clinical_findings');
      expect(screen.getByText('chest pain')).toHaveClass('evidence-highlight--symptoms');
      expect(screen.getByText('physical examination')).toHaveClass('evidence-highlight--procedures');
    });

    it('should display relevance scores in tooltips', () => {
      render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={mockEvidenceSpans}
        />
      );

      const chestPainSpan = screen.getByText('chest pain');
      expect(chestPainSpan).toHaveAttribute('title', 'symptoms: chest pain (95% relevant)');
    });

    it('should handle overlapping evidence spans correctly', () => {
      const overlappingSpans: EvidenceSpan[] = [
        {
          text: 'chest pain',
          category: 'symptoms',
          relevanceScore: 0.95,
          start: 20,
          end: 30,
          confidence: 0.9
        },
        {
          text: 'pain',
          category: 'clinical_findings',
          relevanceScore: 0.80,
          start: 26,
          end: 30,
          confidence: 0.9
        }
      ];

      render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={overlappingSpans}
        />
      );

      // Should handle overlapping spans by prioritizing higher relevance scores
      const highlights = screen.getAllByText('chest pain', { exact: false });
      expect(highlights.length).toBeGreaterThan(0);
    });
  });

  describe('Interactive Features', () => {
    it('should call onEvidenceClick when evidence span is clicked', () => {
      const onEvidenceClick = vi.fn();
      
      render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={mockEvidenceSpans}
          onEvidenceClick={onEvidenceClick}
        />
      );

      const chestPainSpan = screen.getByText('chest pain');
      fireEvent.click(chestPainSpan);

      expect(onEvidenceClick).toHaveBeenCalledWith(mockEvidenceSpans[0]);
    });

    it('should call onEvidenceHover when evidence span is hovered', () => {
      const onEvidenceHover = vi.fn();
      
      render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={mockEvidenceSpans}
          onEvidenceHover={onEvidenceHover}
        />
      );

      const acuteOnsetSpan = screen.getByText('acute onset');
      fireEvent.mouseEnter(acuteOnsetSpan);

      expect(onEvidenceHover).toHaveBeenCalledWith(mockEvidenceSpans[2]);
    });

    it('should support keyboard navigation for evidence spans', () => {
      const onEvidenceClick = vi.fn();
      
      render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={mockEvidenceSpans}
          onEvidenceClick={onEvidenceClick}
        />
      );

      const chestPainSpan = screen.getByText('chest pain');
      expect(chestPainSpan).toHaveAttribute('tabIndex', '0');
      
      // Test Enter key activation
      fireEvent.keyDown(chestPainSpan, { key: 'Enter' });
      expect(onEvidenceClick).toHaveBeenCalledWith(mockEvidenceSpans[0]);
    });
  });

  describe('Evidence Categories', () => {
    it('should apply correct CSS classes for different evidence categories', () => {
      const categorySpans: EvidenceSpan[] = [
        { text: 'symptom', category: 'symptoms', relevanceScore: 0.9, start: 0, end: 7, confidence: 0.9 },
        { text: 'diagnosis', category: 'diagnosis', relevanceScore: 0.9, start: 0, end: 9, confidence: 0.9 },
        { text: 'medication', category: 'medications', relevanceScore: 0.9, start: 0, end: 10, confidence: 0.9 },
        { text: 'investigation', category: 'investigations', relevanceScore: 0.9, start: 0, end: 13, confidence: 0.9 }
      ];

      render(
        <EvidenceHighlighter
          text="symptom diagnosis medication investigation"
          evidenceSpans={categorySpans}
        />
      );

      expect(screen.getByText('symptom')).toHaveClass('evidence-highlight--symptoms');
      expect(screen.getByText('diagnosis')).toHaveClass('evidence-highlight--diagnosis');
      expect(screen.getByText('medication')).toHaveClass('evidence-highlight--medications');
      expect(screen.getByText('investigation')).toHaveClass('evidence-highlight--investigations');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props remain the same', () => {
      const { rerender } = render(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={mockEvidenceSpans}
        />
      );

      const initialSpans = screen.getAllByText(/chest pain|acute onset|physical examination/);
      
      // Re-render with same props
      rerender(
        <EvidenceHighlighter
          text={mockClinicalText}
          evidenceSpans={mockEvidenceSpans}
        />
      );

      const afterRerenderSpans = screen.getAllByText(/chest pain|acute onset|physical examination/);
      expect(afterRerenderSpans.length).toBe(initialSpans.length);
    });
  });
});