/**
 * Evidence Highlighter Component
 * 
 * Highlights evidence spans within clinical text for Phase 3 enhanced analysis.
 * Provides interactive highlighting with hover effects and click handlers.
 */

import React, { memo, useCallback } from 'react';
import { EvidenceSpan } from '../../../types/enhancedAnalysis.types';
import './EvidenceHighlighter.css';

interface EvidenceHighlighterProps {
  /** Clinical text to highlight */
  text: string;
  /** Evidence spans to highlight within the text */
  evidenceSpans: EvidenceSpan[];
  /** Handler for evidence span clicks */
  onEvidenceClick?: (evidenceSpan: EvidenceSpan) => void;
  /** Handler for evidence span hover */
  onEvidenceHover?: (evidenceSpan: EvidenceSpan) => void;
  /** Additional data attributes for testing */
  'data-testid'?: string;
  /** Additional CSS classes */
  className?: string;
}

interface HighlightSegment {
  text: string;
  isHighlighted: boolean;
  evidenceSpan?: EvidenceSpan;
  startIndex: number;
  endIndex: number;
}

/**
 * Evidence Highlighter Component
 */
const EvidenceHighlighter: React.FC<EvidenceHighlighterProps> = memo(({
  text,
  evidenceSpans,
  onEvidenceClick,
  onEvidenceHover,
  'data-testid': testId,
  className = ''
}) => {
  // Sort evidence spans by start index to handle overlaps properly
  const sortedSpans = [...evidenceSpans].sort((a, b) => {
    // Primary sort by start index
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    // Secondary sort by relevance score (higher first) for overlaps
    return b.relevanceScore - a.relevanceScore;
  });

  // Create segments for highlighting
  const createHighlightSegments = useCallback((): HighlightSegment[] => {
    if (sortedSpans.length === 0) {
      return [{ 
        text, 
        isHighlighted: false, 
        startIndex: 0, 
        endIndex: text.length 
      }];
    }

    const segments: HighlightSegment[] = [];
    let currentIndex = 0;

    for (const span of sortedSpans) {
      // Add non-highlighted text before this span
      if (currentIndex < span.start) {
        segments.push({
          text: text.substring(currentIndex, span.start),
          isHighlighted: false,
          startIndex: currentIndex,
          endIndex: span.start
        });
      }

      // Add highlighted span (avoid overlapping by checking current index)
      if (currentIndex <= span.start) {
        segments.push({
          text: text.substring(span.start, span.end),
          isHighlighted: true,
          evidenceSpan: span,
          startIndex: span.start,
          endIndex: span.end
        });
        currentIndex = Math.max(currentIndex, span.end);
      }
    }

    // Add remaining non-highlighted text
    if (currentIndex < text.length) {
      segments.push({
        text: text.substring(currentIndex),
        isHighlighted: false,
        startIndex: currentIndex,
        endIndex: text.length
      });
    }

    return segments;
  }, [text, sortedSpans]);

  // Handle evidence click
  const handleEvidenceClick = useCallback((evidenceSpan: EvidenceSpan) => {
    onEvidenceClick?.(evidenceSpan);
  }, [onEvidenceClick]);

  // Handle evidence hover
  const handleEvidenceHover = useCallback((evidenceSpan: EvidenceSpan) => {
    onEvidenceHover?.(evidenceSpan);
  }, [onEvidenceHover]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent, evidenceSpan: EvidenceSpan) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleEvidenceClick(evidenceSpan);
    }
  }, [handleEvidenceClick]);

  // Get CSS class for evidence category
  const getEvidenceCategoryClass = (category: string): string => {
    return `evidence-highlight--${category}`;
  };

  // Format tooltip text
  const getTooltipText = (evidenceSpan: EvidenceSpan): string => {
    const percentage = Math.round(evidenceSpan.relevanceScore * 100);
    return `${evidenceSpan.category}: ${evidenceSpan.text} (${percentage}% relevant)`;
  };

  const segments = createHighlightSegments();

  return (
    <div 
      className={`evidence-highlighter ${className}`.trim()}
      data-testid={testId}
      role="region"
      aria-label="Clinical text with evidence highlighting"
    >
      {segments.map((segment, index) => {
        if (!segment.isHighlighted) {
          return <span key={index}>{segment.text}</span>;
        }

        const evidenceSpan = segment.evidenceSpan!;
        
        return (
          <span
            key={index}
            className={`evidence-highlight ${getEvidenceCategoryClass(evidenceSpan.category)}`}
            title={getTooltipText(evidenceSpan)}
            onClick={() => handleEvidenceClick(evidenceSpan)}
            onMouseEnter={() => handleEvidenceHover(evidenceSpan)}
            onKeyDown={(e) => handleKeyDown(e, evidenceSpan)}
            tabIndex={0}
            role="button"
            aria-label={`Evidence: ${evidenceSpan.text} (${evidenceSpan.category})`}
          >
            {segment.text}
          </span>
        );
      })}
    </div>
  );
});

EvidenceHighlighter.displayName = 'EvidenceHighlighter';

export default EvidenceHighlighter;