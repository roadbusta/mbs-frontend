/**
 * Performance Analytics Page
 * 
 * Advanced analytics dashboard showing detailed performance metrics,
 * trends, and insights for the MBS coding system.
 */

import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, DonutChart } from '../components/Charts';
import { ChartDataPoint } from '../components/Charts/BaseChart';
import KPIGrid from '../components/KPICards/KPIGrid';
import { KPIData } from '../components/KPICards/KPICard';
import metricsService from '../services/metricsService';
import './PerformanceAnalytics.css';

interface PerformanceMetrics {
  accuracyTrend: ChartDataPoint[];
  processingTimeTrend: ChartDataPoint[];
  volumeByContext: ChartDataPoint[];
  errorBreakdown: ChartDataPoint[];
  responseTimeDistribution: ChartDataPoint[];
  userSatisfactionTrend: ChartDataPoint[];
}

const PerformanceAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load KPI data
        const kpis = await metricsService.getKPIData();
        setKpiData(kpis);

        // Generate performance metrics data
        const performanceData = generateMockPerformanceData(timeRange);
        setMetrics(performanceData);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load performance analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load performance data');
        setIsLoading(false);
      }
    };

    loadPerformanceData();
  }, [timeRange]);

  // Handle time range changes
  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range);
  };

  // Generate mock performance data based on time range
  const generateMockPerformanceData = (range: string): PerformanceMetrics => {
    const dataPoints = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - dataPoints);

    // Accuracy trend over time
    const accuracyTrend: ChartDataPoint[] = Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      return {
        label: range === '7d' || range === '30d' 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: Math.round((95 + Math.random() * 4 + Math.sin(i / 10) * 2) * 10) / 10,
        color: '#4285f4'
      };
    });

    // Processing time trend
    const processingTimeTrend: ChartDataPoint[] = Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      return {
        label: range === '7d' || range === '30d' 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: Math.round((1.2 + Math.random() * 0.8 + Math.sin(i / 15) * 0.3) * 100) / 100,
        color: '#34a853'
      };
    });

    // Volume by consultation context
    const volumeByContext: ChartDataPoint[] = [
      { label: 'General Practice', value: 4521, color: '#4285f4' },
      { label: 'Specialist', value: 2843, color: '#34a853' },
      { label: 'Emergency', value: 1674, color: '#ff9800' },
      { label: 'Mental Health', value: 1205, color: '#9c27b0' },
      { label: 'Surgery', value: 856, color: '#ea4335' },
      { label: 'Radiology', value: 643, color: '#00bcd4' }
    ];

    // Error breakdown
    const errorBreakdown: ChartDataPoint[] = [
      { label: 'Timeout Errors', value: 45, color: '#ea4335' },
      { label: 'Validation Errors', value: 32, color: '#ff9800' },
      { label: 'Processing Errors', value: 18, color: '#f44336' },
      { label: 'Network Errors', value: 12, color: '#ff5722' },
      { label: 'Other', value: 8, color: '#795548' }
    ];

    // Response time distribution
    const responseTimeDistribution: ChartDataPoint[] = [
      { label: '< 1s', value: 6823, color: '#4caf50' },
      { label: '1-2s', value: 2156, color: '#8bc34a' },
      { label: '2-5s', value: 892, color: '#ffc107' },
      { label: '5-10s', value: 234, color: '#ff9800' },
      { label: '> 10s', value: 67, color: '#f44336' }
    ];

    // User satisfaction trend
    const userSatisfactionTrend: ChartDataPoint[] = Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      return {
        label: range === '7d' || range === '30d' 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: Math.round((4.5 + Math.random() * 0.4 + Math.sin(i / 20) * 0.2) * 10) / 10,
        color: '#9c27b0'
      };
    });

    return {
      accuracyTrend,
      processingTimeTrend,
      volumeByContext,
      errorBreakdown,
      responseTimeDistribution,
      userSatisfactionTrend
    };
  };

  if (isLoading) {
    return (
      <div className="performance-analytics">
        <div className="loading-state">
          <div className="loading-spinner-large"></div>
          <p>Loading performance analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-analytics">
        <div className="error-state">
          <h2>Unable to Load Analytics</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-analytics">
      {/* Header with time range selector */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>Performance Analytics</h1>
          <p>Detailed insights into system performance and user experience</p>
        </div>
        
        <div className="time-range-selector">
          <label htmlFor="timeRange">Time Range:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as typeof timeRange)}
            className="time-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <section className="analytics-section">
        <h2>Key Performance Indicators</h2>
        <KPIGrid 
          kpis={kpiData}
          gridSize="4"
          className="analytics-kpi-grid"
        />
      </section>

      {/* Trend Analysis */}
      <section className="analytics-section">
        <h2>Trend Analysis</h2>
        <div className="charts-grid">
          <div className="chart-item">
            <LineChart
              data={metrics?.accuracyTrend || []}
              title="Accuracy Trend"
              subtitle={`Analysis accuracy over ${timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : '1 year'}`}
              height={250}
              showDataPoints={true}
              smooth={true}
              fillArea={true}
              yAxisLabel="Accuracy (%)"
              className="trend-chart"
            />
          </div>
          
          <div className="chart-item">
            <LineChart
              data={metrics?.processingTimeTrend || []}
              title="Processing Time Trend"
              subtitle="Average processing time over time"
              height={250}
              showDataPoints={true}
              smooth={true}
              yAxisLabel="Time (seconds)"
              className="trend-chart"
            />
          </div>
        </div>
      </section>

      {/* Volume Analysis */}
      <section className="analytics-section">
        <h2>Volume Analysis</h2>
        <div className="charts-grid">
          <div className="chart-item">
            <BarChart
              data={metrics?.volumeByContext || []}
              title="Analysis Volume by Context"
              subtitle="Total analyses processed by consultation type"
              height={300}
              showValues={true}
              yAxisLabel="Number of Analyses"
              className="volume-chart"
            />
          </div>
          
          <div className="chart-item">
            <DonutChart
              data={metrics?.responseTimeDistribution || []}
              title="Response Time Distribution"
              subtitle="Distribution of processing response times"
              height={300}
              showCenterText={true}
              centerText="10.2K"
              centerSubtext="Total Requests"
              className="distribution-chart"
            />
          </div>
        </div>
      </section>

      {/* Error Analysis */}
      <section className="analytics-section">
        <h2>Error Analysis</h2>
        <div className="charts-grid">
          <div className="chart-item">
            <DonutChart
              data={metrics?.errorBreakdown || []}
              title="Error Breakdown"
              subtitle="Distribution of error types"
              height={300}
              showCenterText={true}
              centerText="115"
              centerSubtext="Total Errors"
              className="error-chart"
            />
          </div>
          
          <div className="chart-item">
            <LineChart
              data={metrics?.userSatisfactionTrend || []}
              title="User Satisfaction Trend"
              subtitle="Average user satisfaction rating"
              height={300}
              showDataPoints={true}
              smooth={true}
              yAxisLabel="Rating (1-5)"
              className="satisfaction-chart"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PerformanceAnalytics;