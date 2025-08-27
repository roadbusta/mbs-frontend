/**
 * Highlighted Text Component
 * 
 * Displays consultation text with highlighted sections that correspond to 
 * evidence spans supporting MBS code recommendations.
 * 
 * Features:
 * - Multi-color highlighting for different codes
 * - Interactive highlights showing which code they support
 * - Relevance-based highlighting intensity
 * - Hover effects with code information
 * - Accessible design with proper ARIA labels
 */

import React, { useState } from 'react';
import { EvidenceSpan, CodeRecommendation } from '../../types/api.types';
import './HighlightedText.css';

interface HighlightedTextProps {
  /** Original consultation text */
  text: string;
  /** MBS code recommendations with evidence spans */
  recommendations: CodeRecommendation[];
  /** Currently selected/highlighted code for emphasis */
  selectedCode?: string;
  /** Handler for when a highlighted section is clicked */
  onEvidenceClick?: (codeId: string, evidenceSpan: EvidenceSpan) => void;
}

/**
 * Color scheme for highlighting different codes
 */
const HIGHLIGHT_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green  
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
];

/**
 * Text segment with highlighting information
 */
interface TextSegment {
  text: string;
  start: number;
  end: number;
  evidenceSpans: Array<{
    codeId: string;
    span: EvidenceSpan;
    color: string;
  }>;
}

/**
 * Highlighted Text Component
 */
const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  recommendations,
  selectedCode,
  onEvidenceClick,
}) => {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  /**
   * Process text and create segments with highlighting information
   */
  const processTextSegments = (): TextSegment[] => {
    const segments: TextSegment[] = [];
    const evidencePoints: Array<{
      position: number;
      type: 'start' | 'end';
      codeId: string;
      span: EvidenceSpan;
      color: string;
    }> = [];

    // Collect all evidence points
    recommendations.forEach((rec, index) => {
      if (rec.evidence_spans) {
        const color = HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length];
        rec.evidence_spans.forEach((span) => {
          evidencePoints.push({
            position: span.start,
            type: 'start',
            codeId: rec.code,
            span,
            color,
          });
          evidencePoints.push({
            position: span.end,
            type: 'end',
            codeId: rec.code,
            span,
            color,
          });
        });
      }
    });

    // Sort evidence points by position
    evidencePoints.sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      // End points come before start points at same position
      return a.type === 'end' ? -1 : 1;
    });

    // Create segments
    let currentPos = 0;
    let activeSpans: Array<{
      codeId: string;
      span: EvidenceSpan;
      color: string;
    }> = [];

    evidencePoints.forEach((point) => {
      // Create segment for text before this point
      if (point.position > currentPos) {
        segments.push({
          text: text.substring(currentPos, point.position),
          start: currentPos,
          end: point.position,
          evidenceSpans: [...activeSpans],
        });
        currentPos = point.position;
      }

      // Update active spans
      if (point.type === 'start') {
        activeSpans.push({
          codeId: point.codeId,
          span: point.span,
          color: point.color,
        });
      } else {
        activeSpans = activeSpans.filter(
          (span) => !(span.codeId === point.codeId && span.span === point.span)
        );
      }
    });

    // Add final segment
    if (currentPos < text.length) {
      segments.push({
        text: text.substring(currentPos),
        start: currentPos,
        end: text.length,
        evidenceSpans: [...activeSpans],
      });
    }

    return segments.filter((seg) => seg.text.length > 0);
  };

  /**
   * Get CSS styles for a highlighted segment
   */
  const getSegmentStyles = (segment: TextSegment): React.CSSProperties => {
    if (segment.evidenceSpans.length === 0) return {};

    // Multiple spans create a gradient
    if (segment.evidenceSpans.length > 1) {
      const colors = segment.evidenceSpans.map((span) => span.color);
      return {
        background: `linear-gradient(45deg, ${colors.join(', ')})`,
        opacity: selectedCode ? 
          (segment.evidenceSpans.some(span => span.codeId === selectedCode) ? 0.8 : 0.3) : 
          0.6,
      };
    }

    // Single span
    const span = segment.evidenceSpans[0];
    const relevance = span.span.relevance || 0.7;
    return {
      backgroundColor: span.color,
      opacity: selectedCode ? 
        (span.codeId === selectedCode ? 0.8 : 0.3) : 
        relevance * 0.8,
    };
  };

  /**
   * Get CSS class for a segment
   */
  const getSegmentClass = (segment: TextSegment): string => {
    const classes = ['text-segment'];
    
    if (segment.evidenceSpans.length > 0) {
      classes.push('highlighted');
      
      if (selectedCode && segment.evidenceSpans.some(span => span.codeId === selectedCode)) {
        classes.push('selected');
      }
      
      if (hoveredCode && segment.evidenceSpans.some(span => span.codeId === hoveredCode)) {
        classes.push('hovered');
      }
    }
    
    return classes.join(' ');
  };

  /**
   * Handle segment click
   */
  const handleSegmentClick = (segment: TextSegment) => {
    if (segment.evidenceSpans.length > 0 && onEvidenceClick) {
      const primarySpan = segment.evidenceSpans[0];
      onEvidenceClick(primarySpan.codeId, primarySpan.span);
    }
  };

  /**
   * Get tooltip content for segment
   */
  const getTooltipContent = (segment: TextSegment): string => {
    if (segment.evidenceSpans.length === 0) return '';
    
    const codes = segment.evidenceSpans.map(span => span.codeId).join(', ');
    return `Evidence for MBS Code${segment.evidenceSpans.length > 1 ? 's' : ''}: ${codes}`;
  };

  const segments = processTextSegments();

  return (
    <div className="highlighted-text-container">
      <div className="highlighted-text">
        {segments.map((segment, index) => (
          <span
            key={index}
            className={getSegmentClass(segment)}
            style={getSegmentStyles(segment)}
            onClick={() => handleSegmentClick(segment)}
            onMouseEnter={() => {
              if (segment.evidenceSpans.length > 0) {
                setHoveredCode(segment.evidenceSpans[0].codeId);
              }
            }}
            onMouseLeave={() => setHoveredCode(null)}
            title={getTooltipContent(segment)}
            role={segment.evidenceSpans.length > 0 ? 'button' : undefined}
            tabIndex={segment.evidenceSpans.length > 0 ? 0 : undefined}
            aria-label={getTooltipContent(segment)}
          >
            {segment.text}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="highlight-legend">
        <h4>Evidence Legend:</h4>
        <div className="legend-items">
          {recommendations.map((rec, index) => (
            <div 
              key={rec.code} 
              className={`legend-item ${selectedCode === rec.code ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredCode(rec.code)}
              onMouseLeave={() => setHoveredCode(null)}
            >
              <div
                className="legend-color"
                style={{ backgroundColor: HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length] }}
              />
              <span className="legend-text">
                Code {rec.code}: {rec.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HighlightedText;