/**
 * Data Visualization Service
 * 
 * Service for processing, transforming, and formatting data for various chart types.
 * Provides data aggregation, filtering, and statistical analysis capabilities.
 */

import { ChartDataPoint } from '../components/Charts/BaseChart';
import { ActivityItem } from '../components/ActivityFeed/ActivityFeed';

export interface DataAggregationOptions {
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year';
  aggregateFunction: 'sum' | 'average' | 'count' | 'min' | 'max';
  fillGaps?: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  correlation: number;
  seasonality?: {
    detected: boolean;
    period?: number;
  };
}

export interface StatisticalSummary {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'donut' | 'area' | 'scatter';
  colors?: string[];
  responsive: boolean;
  animations: boolean;
  tooltips: boolean;
  legend: boolean;
  gridLines?: boolean;
  dataLabels?: boolean;
}

class DataVisualizationService {
  private colorPalettes = {
    healthcare: ['#4285f4', '#34a853', '#ff9800', '#ea4335', '#9c27b0'],
    performance: ['#1e88e5', '#43a047', '#fb8c00', '#e53935', '#8e24aa'],
    accessibility: ['#0d47a1', '#1b5e20', '#e65100', '#b71c1c', '#4a148c'],
    monochrome: ['#212121', '#424242', '#616161', '#757575', '#9e9e9e']
  };

  /**
   * Transform raw data into chart-ready format
   */
  formatForChart(
    rawData: any[],
    labelField: string,
    valueField: string,
    options?: { 
      colorField?: string; 
      sortBy?: 'label' | 'value' | 'none';
      sortOrder?: 'asc' | 'desc';
      maxItems?: number;
    }
  ): ChartDataPoint[] {
    let formattedData: ChartDataPoint[] = rawData.map((item, index) => ({
      label: this.formatLabel(item[labelField]),
      value: this.parseValue(item[valueField]),
      color: options?.colorField 
        ? item[options.colorField] 
        : this.colorPalettes.healthcare[index % this.colorPalettes.healthcare.length],
      metadata: item
    }));

    // Apply sorting
    if (options?.sortBy && options.sortBy !== 'none') {
      formattedData.sort((a, b) => {
        let comparison = 0;
        
        if (options.sortBy === 'label') {
          comparison = a.label.localeCompare(b.label);
        } else if (options.sortBy === 'value') {
          comparison = a.value - b.value;
        }
        
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Limit items if specified
    if (options?.maxItems && formattedData.length > options.maxItems) {
      formattedData = formattedData.slice(0, options.maxItems);
    }

    return formattedData;
  }

  /**
   * Aggregate time series data
   */
  aggregateTimeSeriesData(
    data: Array<{ timestamp: Date; value: number; [key: string]: any }>,
    options: DataAggregationOptions
  ): ChartDataPoint[] {
    const groupedData = this.groupDataByTime(data, options.groupBy, options.timeRange);
    
    return Object.entries(groupedData).map(([timeKey, values]) => {
      let aggregatedValue: number;
      
      switch (options.aggregateFunction) {
        case 'sum':
          aggregatedValue = values.reduce((sum, item) => sum + item.value, 0);
          break;
        case 'average':
          aggregatedValue = values.reduce((sum, item) => sum + item.value, 0) / values.length;
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        case 'min':
          aggregatedValue = Math.min(...values.map(item => item.value));
          break;
        case 'max':
          aggregatedValue = Math.max(...values.map(item => item.value));
          break;
        default:
          aggregatedValue = values.reduce((sum, item) => sum + item.value, 0) / values.length;
      }

      return {
        label: this.formatTimeLabel(timeKey, options.groupBy),
        value: Math.round(aggregatedValue * 100) / 100,
        metadata: {
          count: values.length,
          timeKey,
          rawData: values
        }
      };
    }).sort((a, b) => new Date(a.metadata.timeKey).getTime() - new Date(b.metadata.timeKey).getTime());
  }

  /**
   * Process activity data for visualization
   */
  processActivityData(
    activities: ActivityItem[],
    groupBy: 'status' | 'action' | 'context' | 'time'
  ): ChartDataPoint[] {
    const groupedData: Record<string, ActivityItem[]> = {};

    activities.forEach(activity => {
      let key: string;
      
      switch (groupBy) {
        case 'status':
          key = activity.status;
          break;
        case 'action':
          key = activity.action;
          break;
        case 'context':
          key = activity.context || 'Unknown';
          break;
        case 'time':
          key = this.getTimeGroup(activity.timestamp);
          break;
        default:
          key = 'Other';
      }

      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(activity);
    });

    return Object.entries(groupedData).map(([key, items]) => ({
      label: key,
      value: items.length,
      color: this.getColorForGroup(key, groupBy),
      metadata: {
        items,
        averageProcessingTime: this.calculateAverageProcessingTime(items)
      }
    }));
  }

  /**
   * Calculate trend analysis for time series data
   */
  analyzeTrend(data: ChartDataPoint[]): TrendAnalysis {
    if (data.length < 2) {
      return {
        trend: 'stable',
        changePercent: 0,
        correlation: 0
      };
    }

    const values = data.map(point => point.value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;

    // Calculate linear correlation
    const correlation = this.calculateLinearCorrelation(
      data.map((_, index) => index),
      values
    );

    // Determine trend direction
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(changePercent) < 5) {
      trend = 'stable';
    } else if (changePercent > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    // Simple seasonality detection
    const seasonality = this.detectSeasonality(values);

    return {
      trend,
      changePercent: Math.round(changePercent * 100) / 100,
      correlation: Math.round(correlation * 100) / 100,
      seasonality
    };
  }

  /**
   * Calculate statistical summary
   */
  calculateStatistics(data: ChartDataPoint[]): StatisticalSummary {
    const values = data.map(point => point.value).sort((a, b) => a - b);
    const n = values.length;

    if (n === 0) {
      throw new Error('Cannot calculate statistics for empty dataset');
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    
    const median = n % 2 === 0 
      ? (values[n / 2 - 1] + values[n / 2]) / 2 
      : values[Math.floor(n / 2)];

    // Calculate mode (most frequent value)
    const frequency: Record<number, number> = {};
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    const mode = Number(Object.keys(frequency).reduce((a, b) => 
      frequency[Number(a)] > frequency[Number(b)] ? a : b
    ));

    // Calculate variance and standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);

    const min = values[0];
    const max = values[n - 1];
    const range = max - min;

    // Calculate percentiles
    const percentiles = {
      p25: this.calculatePercentile(values, 25),
      p50: median,
      p75: this.calculatePercentile(values, 75),
      p90: this.calculatePercentile(values, 90),
      p95: this.calculatePercentile(values, 95)
    };

    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      mode: Math.round(mode * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      min,
      max,
      range,
      percentiles: {
        p25: Math.round(percentiles.p25 * 100) / 100,
        p50: Math.round(percentiles.p50 * 100) / 100,
        p75: Math.round(percentiles.p75 * 100) / 100,
        p90: Math.round(percentiles.p90 * 100) / 100,
        p95: Math.round(percentiles.p95 * 100) / 100
      }
    };
  }

  /**
   * Generate chart configuration based on data characteristics
   */
  generateChartConfig(
    data: ChartDataPoint[],
    chartType: ChartConfiguration['type'],
    options?: Partial<ChartConfiguration>
  ): ChartConfiguration {
    const dataSize = data.length;
    const hasTimeSeries = data.every(point => 
      point.metadata && point.metadata.timeKey
    );

    return {
      type: chartType,
      colors: options?.colors || this.selectOptimalColorPalette(dataSize),
      responsive: options?.responsive ?? true,
      animations: options?.animations ?? true,
      tooltips: options?.tooltips ?? true,
      legend: options?.legend ?? (dataSize <= 10),
      gridLines: options?.gridLines ?? hasTimeSeries,
      dataLabels: options?.dataLabels ?? (dataSize <= 8)
    };
  }

  // Private helper methods

  private formatLabel(label: any): string {
    if (typeof label === 'string') return label;
    if (label instanceof Date) return label.toLocaleDateString();
    return String(label);
  }

  private parseValue(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private groupDataByTime(
    data: Array<{ timestamp: Date; value: number; [key: string]: any }>,
    groupBy: DataAggregationOptions['groupBy'],
    timeRange?: { start: Date; end: Date }
  ): Record<string, Array<{ value: number; [key: string]: any }>> {
    const filtered = timeRange 
      ? data.filter(item => item.timestamp >= timeRange.start && item.timestamp <= timeRange.end)
      : data;

    const grouped: Record<string, Array<{ value: number; [key: string]: any }>> = {};

    filtered.forEach(item => {
      const timeKey = this.getTimeKey(item.timestamp, groupBy);
      if (!grouped[timeKey]) {
        grouped[timeKey] = [];
      }
      grouped[timeKey].push(item);
    });

    return grouped;
  }

  private getTimeKey(date: Date, groupBy: DataAggregationOptions['groupBy']): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const week = this.getWeekNumber(date);

    switch (groupBy) {
      case 'day':
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      case 'week':
        return `${year}-W${String(week).padStart(2, '0')}`;
      case 'month':
        return `${year}-${String(month + 1).padStart(2, '0')}`;
      case 'quarter':
        const quarter = Math.floor(month / 3) + 1;
        return `${year}-Q${quarter}`;
      case 'year':
        return String(year);
      default:
        return String(date.getTime());
    }
  }

  private formatTimeLabel(timeKey: string, groupBy: DataAggregationOptions['groupBy']): string {
    switch (groupBy) {
      case 'day':
        return new Date(timeKey).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'week':
        const [year, week] = timeKey.split('-W');
        return `W${week} ${year}`;
      case 'month':
        const [yearStr, monthStr] = timeKey.split('-');
        const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
      case 'quarter':
        return timeKey.replace('-', ' ');
      case 'year':
        return timeKey;
      default:
        return timeKey;
    }
  }

  private getTimeGroup(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return 'Night (12-6 AM)';
    if (hour < 12) return 'Morning (6-12 PM)';
    if (hour < 18) return 'Afternoon (12-6 PM)';
    return 'Evening (6-12 AM)';
  }

  private getColorForGroup(key: string, _groupBy: string): string {
    const colors = this.colorPalettes.healthcare;
    const hash = this.hashString(key);
    return colors[hash % colors.length];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private calculateAverageProcessingTime(activities: ActivityItem[]): number | undefined {
    const timings = activities
      .filter(activity => activity.processingTime)
      .map(activity => parseFloat(activity.processingTime!.replace('s', '')));

    if (timings.length === 0) return undefined;

    return timings.reduce((sum, time) => sum + time, 0) / timings.length;
  }

  private calculateLinearCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private detectSeasonality(values: number[]): { detected: boolean; period?: number } {
    // Simple seasonality detection using autocorrelation
    if (values.length < 12) return { detected: false };

    const autocorrelations = [];
    for (let lag = 1; lag <= Math.min(12, Math.floor(values.length / 2)); lag++) {
      const correlation = this.calculateAutocorrelation(values, lag);
      autocorrelations.push({ lag, correlation });
    }

    const significantCorrelations = autocorrelations.filter(
      ({ correlation }) => Math.abs(correlation) > 0.3
    );

    if (significantCorrelations.length > 0) {
      const strongestCorrelation = significantCorrelations.reduce(
        (max, current) => Math.abs(current.correlation) > Math.abs(max.correlation) ? current : max
      );

      return {
        detected: true,
        period: strongestCorrelation.lag
      };
    }

    return { detected: false };
  }

  private calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length - lag;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += (values[i] - mean) ** 2;
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1);
    
    if (Number.isInteger(index)) {
      return sortedValues[index];
    }
    
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private selectOptimalColorPalette(dataSize: number): string[] {
    if (dataSize <= 5) return this.colorPalettes.healthcare;
    if (dataSize <= 8) return this.colorPalettes.performance;
    return this.colorPalettes.accessibility;
  }
}

// Create and export singleton instance
const dataVisualizationService = new DataVisualizationService();
export default dataVisualizationService;