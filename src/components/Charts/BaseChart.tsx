/**
 * Base Chart Component
 * 
 * Foundation component for all chart types with common functionality
 * like loading states, error handling, and responsive design.
 */

import React from 'react';
import './BaseChart.css';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface ChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTooltips?: boolean;
  responsive?: boolean;
}

interface BaseChartProps extends ChartProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

const BaseChart: React.FC<BaseChartProps> = ({
  children,
  title,
  subtitle,
  loading = false,
  error,
  height = 300,
  className = '',
  onRetry,
  data
}) => {
  if (error) {
    return (
      <div className={`chart-container chart-container--error ${className}`}>
        <div className="chart-error">
          <div className="error-icon">📊❌</div>
          <div className="error-content">
            <h4>Unable to Load Chart</h4>
            <p>{error}</p>
            {onRetry && (
              <button 
                className="retry-button"
                onClick={onRetry}
                type="button"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`chart-container chart-container--loading ${className}`}>
        {title && (
          <div className="chart-header">
            <h3 className="chart-title">{title}</h3>
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="chart-loading" style={{ height }}>
          <div className="loading-spinner-chart"></div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`chart-container chart-container--empty ${className}`}>
        {title && (
          <div className="chart-header">
            <h3 className="chart-title">{title}</h3>
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="chart-empty" style={{ height }}>
          <div className="empty-icon">📊</div>
          <h4>No Data Available</h4>
          <p>No data is currently available for this chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-container ${className}`}>
      {title && (
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="chart-content" style={{ height }}>
        {children}
      </div>
    </div>
  );
};

export default BaseChart;