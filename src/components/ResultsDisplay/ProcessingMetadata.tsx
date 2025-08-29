/**
 * Processing Metadata Component
 * 
 * Displays detailed processing information and pipeline metrics.
 * Technical information for understanding AI analysis performance.
 * 
 * Features:
 * - Pipeline stage breakdown
 * - Processing performance metrics
 * - Categorization details
 * - Model information
 * - Technical debugging information
 */

import React from 'react';
import { ProcessingMetadata as ProcessingMetadataType } from '../../types/api.types';
import './ProcessingMetadata.css';

interface ProcessingMetadataProps {
  /** Processing metadata from API response */
  metadata: ProcessingMetadataType;
}

/**
 * Processing Metadata Component
 */
const ProcessingMetadata: React.FC<ProcessingMetadataProps> = ({ metadata }) => {
  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * Format processing time
   */
  const formatProcessingTime = (timeMs: number): string => {
    if (timeMs < 1000) return `${timeMs}ms`;
    const seconds = (timeMs / 1000).toFixed(2);
    return `${seconds}s`;
  };

  /**
   * Calculate reduction efficiency
   */
  const getReductionEfficiency = (): string => {
    if (!metadata.categorization) return 'N/A';
    return `${metadata.categorization.reduction_percentage.toFixed(1)}%`;
  };

  return (
    <div className="processing-metadata">
      <div className="metadata-header">
        <h3>Processing Details</h3>
      </div>

      <div className="metadata-grid">
        {/* Performance Metrics */}
        <div className="metadata-section">
          <h4>Performance Metrics</h4>
          <div className="metric-list">
            <div className="metric-item">
              <span className="metric-label">Total Processing Time:</span>
              <span className="metric-value">{formatProcessingTime(metadata.processing_time_ms)}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Analysis Timestamp:</span>
              <span className="metric-value">{formatTimestamp(metadata.timestamp)}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Model Used:</span>
              <span className="metric-value">{metadata.model_used || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Stages */}
        {metadata.pipeline_stages && (
          <div className="metadata-section">
            <h4>Pipeline Analysis</h4>
            <div className="pipeline-flow">
              <div className="pipeline-stage">
                <div className="stage-number">1</div>
                <div className="stage-content">
                  <span className="stage-name">TF-IDF Matching</span>
                  <span className="stage-count">{metadata.pipeline_stages.tfidf_candidates} candidates</span>
                </div>
              </div>
              
              <div className="pipeline-arrow">→</div>
              
              <div className="pipeline-stage">
                <div className="stage-number">2</div>
                <div className="stage-content">
                  <span className="stage-name">Embedding Similarity</span>
                  <span className="stage-count">{metadata.pipeline_stages.embedding_candidates} candidates</span>
                </div>
              </div>
              
              <div className="pipeline-arrow">→</div>
              
              <div className="pipeline-stage">
                <div className="stage-number">3</div>
                <div className="stage-content">
                  <span className="stage-name">LLM Analysis</span>
                  <span className="stage-count">{metadata.pipeline_stages.llm_analysed} analysed</span>
                </div>
              </div>
            </div>

            <div className="efficiency-metric">
              <span className="efficiency-label">Filtering Efficiency:</span>
              <span className="efficiency-value">{getReductionEfficiency()} codes filtered</span>
            </div>
          </div>
        )}

        {/* Categorization Info */}
        {metadata.categorization && (
          <div className="metadata-section">
            <h4>Consultation Categorization</h4>
            <div className="categorization-info">
              <div className="category-grid">
                <div className="category-item">
                  <span className="category-label">Primary Category:</span>
                  <span className="category-value">
                    {metadata.categorization.category_name} (Category {metadata.categorization.primary_category})
                  </span>
                </div>
                <div className="category-item">
                  <span className="category-label">Group Focus:</span>
                  <span className="category-value">{metadata.categorization.group_focus}</span>
                </div>
                <div className="category-item">
                  <span className="category-label">Context:</span>
                  <span className="category-value">{metadata.categorization.context}</span>
                </div>
                <div className="category-item">
                  <span className="category-label">Complexity:</span>
                  <span className="category-value">{metadata.categorization.complexity}</span>
                </div>
              </div>
              
              <div className="categorization-confidence">
                <span className="confidence-label">Categorization Confidence:</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${metadata.categorization.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="confidence-percentage">
                  {Math.round(metadata.categorization.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technical Information */}
      <div className="technical-info">
        <h4>Technical Information</h4>
        <div className="tech-details">
          <p>
            This analysis used a hybrid approach combining TF-IDF text matching, 
            semantic embedding similarity, and large language model reasoning to 
            identify the most appropriate MBS codes for the consultation.
          </p>
          {metadata.categorization && (
            <p>
              The intelligent pre-filtering system categorized this consultation and 
              reduced the search space by {getReductionEfficiency()}, improving 
              both speed and accuracy of recommendations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingMetadata;