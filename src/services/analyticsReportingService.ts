/**
 * Analytics Reporting Service
 * 
 * Service for generating comprehensive reports and exports for analytics data.
 * Supports multiple formats and automated report generation.
 */

import { ChartDataPoint } from '../components/Charts/BaseChart';
import { KPIData } from '../components/KPICards/KPICard';
import { ActivityItem } from '../components/ActivityFeed/ActivityFeed';
import dataVisualizationService, { StatisticalSummary, TrendAnalysis } from './dataVisualizationService';
import metricsService from './metricsService';
import activityService from './activityService';

export interface ReportConfiguration {
  title: string;
  subtitle?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  sections: {
    executive_summary?: boolean;
    kpi_overview?: boolean;
    trend_analysis?: boolean;
    performance_metrics?: boolean;
    activity_analysis?: boolean;
    statistical_summary?: boolean;
    recommendations?: boolean;
  };
  format: 'json' | 'csv' | 'pdf' | 'html';
  branding?: {
    logo?: string;
    organization?: string;
    colors?: string[];
  };
}

export interface ReportData {
  metadata: {
    title: string;
    generated_at: Date;
    date_range: {
      start: Date;
      end: Date;
    };
    organization?: string;
  };
  sections: {
    executive_summary?: ExecutiveSummary;
    kpi_overview?: KPIOverview;
    trend_analysis?: TrendAnalysisReport;
    performance_metrics?: PerformanceMetricsReport;
    activity_analysis?: ActivityAnalysisReport;
    statistical_summary?: StatisticalSummaryReport;
    recommendations?: RecommendationsReport;
  };
}

export interface ExecutiveSummary {
  key_highlights: string[];
  performance_overview: {
    accuracy: { current: number; change: number };
    volume: { current: number; change: number };
    efficiency: { current: number; change: number };
  };
  critical_issues: string[];
  success_metrics: string[];
}

export interface KPIOverview {
  kpis: Array<KPIData & {
    target?: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    trend: 'improving' | 'stable' | 'declining';
  }>;
  summary: {
    total_kpis: number;
    above_target: number;
    below_target: number;
    improvement_count: number;
  };
}

export interface TrendAnalysisReport {
  accuracy_trend: TrendAnalysis & { data: ChartDataPoint[] };
  volume_trend: TrendAnalysis & { data: ChartDataPoint[] };
  performance_trend: TrendAnalysis & { data: ChartDataPoint[] };
  forecasts?: {
    accuracy_forecast: ChartDataPoint[];
    volume_forecast: ChartDataPoint[];
  };
}

export interface PerformanceMetricsReport {
  response_times: StatisticalSummary & { data: ChartDataPoint[] };
  error_rates: StatisticalSummary & { data: ChartDataPoint[] };
  throughput: StatisticalSummary & { data: ChartDataPoint[] };
  availability: {
    uptime_percentage: number;
    downtime_incidents: number;
    mttr: number; // Mean Time To Recovery
  };
}

export interface ActivityAnalysisReport {
  by_status: ChartDataPoint[];
  by_context: ChartDataPoint[];
  by_time_of_day: ChartDataPoint[];
  processing_time_analysis: StatisticalSummary;
  anomalies: Array<{
    timestamp: Date;
    type: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }>;
}

export interface StatisticalSummaryReport {
  overall_statistics: StatisticalSummary;
  comparative_analysis: {
    current_vs_previous: {
      period_comparison: string;
      significant_changes: Array<{
        metric: string;
        change_percent: number;
        significance: 'high' | 'medium' | 'low';
      }>;
    };
  };
}

export interface RecommendationsReport {
  performance_recommendations: Array<{
    category: 'accuracy' | 'efficiency' | 'reliability' | 'user_experience';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expected_impact: string;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
  data_quality_issues: Array<{
    issue: string;
    severity: 'critical' | 'major' | 'minor';
    affected_metrics: string[];
    suggested_action: string;
  }>;
}

class AnalyticsReportingService {
  /**
   * Generate comprehensive analytics report
   */
  async generateReport(config: ReportConfiguration): Promise<ReportData> {
    const reportData: ReportData = {
      metadata: {
        title: config.title,
        generated_at: new Date(),
        date_range: config.dateRange,
        organization: config.branding?.organization
      },
      sections: {}
    };

    // Load base data
    const kpiData = await metricsService.getKPIData();
    const activityData = await activityService.getActivities({
      dateRange: config.dateRange,
      limit: 10000
    });

    // Generate each requested section
    if (config.sections.executive_summary) {
      reportData.sections.executive_summary = await this.generateExecutiveSummary(
        kpiData, activityData, config.dateRange
      );
    }

    if (config.sections.kpi_overview) {
      reportData.sections.kpi_overview = await this.generateKPIOverview(kpiData);
    }

    if (config.sections.trend_analysis) {
      reportData.sections.trend_analysis = await this.generateTrendAnalysis(
        kpiData, config.dateRange
      );
    }

    if (config.sections.performance_metrics) {
      reportData.sections.performance_metrics = await this.generatePerformanceMetrics(
        activityData
      );
    }

    if (config.sections.activity_analysis) {
      reportData.sections.activity_analysis = await this.generateActivityAnalysis(
        activityData
      );
    }

    if (config.sections.statistical_summary) {
      reportData.sections.statistical_summary = await this.generateStatisticalSummary(
        kpiData, activityData
      );
    }

    if (config.sections.recommendations) {
      reportData.sections.recommendations = await this.generateRecommendations(
        kpiData, activityData, reportData
      );
    }

    return reportData;
  }

  /**
   * Export report in specified format
   */
  async exportReport(
    reportData: ReportData,
    format: ReportConfiguration['format'],
    filename?: string
  ): Promise<Blob> {
    switch (format) {
      case 'json':
        return this.exportAsJSON(reportData);
      case 'csv':
        return this.exportAsCSV(reportData);
      case 'html':
        return this.exportAsHTML(reportData);
      case 'pdf':
        return this.exportAsPDF(reportData);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Schedule automated report generation
   */
  scheduleReport(
    config: ReportConfiguration,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ): string {
    const reportId = this.generateReportId();
    
    // In a real implementation, this would integrate with a scheduling system
    console.log(`Scheduled report ${reportId} for ${schedule} delivery to:`, recipients);
    
    return reportId;
  }

  // Private methods for report generation

  private async generateExecutiveSummary(
    kpiData: KPIData[],
    activityData: ActivityItem[],
    dateRange: { start: Date; end: Date }
  ): Promise<ExecutiveSummary> {
    // Extract key metrics
    const accuracy = kpiData.find(kpi => kpi.id === 'accuracy');
    const volume = kpiData.find(kpi => kpi.id === 'total_analyses');
    const processingTime = kpiData.find(kpi => kpi.id === 'processing_time');

    const keyHighlights = [
      accuracy ? `Analysis accuracy: ${accuracy.value}` : 'Accuracy metrics unavailable',
      volume ? `Total analyses processed: ${volume.value}` : 'Volume metrics unavailable',
      processingTime ? `Average processing time: ${processingTime.value}` : 'Performance metrics unavailable',
      `Activities processed: ${activityData.length} in selected period`
    ];

    const performanceOverview = {
      accuracy: {
        current: accuracy ? parseFloat(String(accuracy.value).replace('%', '')) : 0,
        change: accuracy?.change?.value || 0
      },
      volume: {
        current: volume ? (typeof volume.value === 'number' ? volume.value : parseInt(String(volume.value).replace(/,/g, ''))) : 0,
        change: volume?.change?.value || 0
      },
      efficiency: {
        current: processingTime ? parseFloat(String(processingTime.value).replace('s', '')) : 0,
        change: processingTime?.change?.value || 0
      }
    };

    const criticalIssues = [];
    const successMetrics = [];

    // Analyze for issues and successes
    if (performanceOverview.accuracy.current < 90) {
      criticalIssues.push('Analysis accuracy below 90% threshold');
    } else {
      successMetrics.push('Analysis accuracy meeting quality standards');
    }

    if (performanceOverview.efficiency.current > 3.0) {
      criticalIssues.push('Processing times exceeding target response time');
    } else {
      successMetrics.push('Processing times within acceptable range');
    }

    const errorActivities = activityData.filter(activity => activity.status === 'error');
    if (errorActivities.length / activityData.length > 0.05) {
      criticalIssues.push('Error rate above 5% threshold');
    } else {
      successMetrics.push('Error rates within acceptable limits');
    }

    return {
      key_highlights: keyHighlights,
      performance_overview: performanceOverview,
      critical_issues: criticalIssues,
      success_metrics: successMetrics
    };
  }

  private async generateKPIOverview(kpiData: KPIData[]): Promise<KPIOverview> {
    const enrichedKPIs: Array<KPIData & { 
      target?: number; 
      status: 'excellent' | 'good' | 'fair' | 'poor'; 
      trendStatus: 'stable' | 'improving' | 'declining';
    }> = kpiData.map(kpi => {
      // Determine status based on value and context
      let status: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
      let target: number | undefined;

      if (kpi.id === 'accuracy') {
        target = 95;
        const value = parseFloat(String(kpi.value).replace('%', ''));
        status = value >= 98 ? 'excellent' : value >= 95 ? 'good' : value >= 90 ? 'fair' : 'poor';
      } else if (kpi.id === 'processing_time') {
        target = 2.0;
        const value = parseFloat(String(kpi.value).replace('s', ''));
        status = value <= 1.0 ? 'excellent' : value <= 2.0 ? 'good' : value <= 3.0 ? 'fair' : 'poor';
      } else if (kpi.id === 'error_rate') {
        target = 1.0;
        const value = parseFloat(String(kpi.value).replace('%', ''));
        status = value <= 0.5 ? 'excellent' : value <= 1.0 ? 'good' : value <= 2.0 ? 'fair' : 'poor';
      }

      // Determine trend
      const trendStatus: 'stable' | 'improving' | 'declining' = !kpi.change 
        ? 'stable' 
        : Math.abs(kpi.change.value) < 1
          ? 'stable'
          : kpi.change.type === 'increase'
            ? 'improving'
            : 'declining';

      return {
        ...kpi,
        target,
        status,
        trendStatus
      };
    });

    const summary = {
      total_kpis: enrichedKPIs.length,
      above_target: enrichedKPIs.filter(kpi => 
        kpi.target && this.compareKPIValue(kpi.value, kpi.target, kpi.id)
      ).length,
      below_target: enrichedKPIs.filter(kpi => 
        kpi.target && !this.compareKPIValue(kpi.value, kpi.target, kpi.id)
      ).length,
      improvement_count: enrichedKPIs.filter(kpi => kpi.trendStatus === 'improving').length
    };

    return {
      kpis: enrichedKPIs,
      summary
    };
  }

  private async generateTrendAnalysis(
    _kpiData: KPIData[],
    dateRange: { start: Date; end: Date }
  ): Promise<TrendAnalysisReport> {
    // Generate mock trend data for demonstration
    const generateTrendData = (baseValue: number, days: number) => {
      const data: ChartDataPoint[] = [];
      const startDate = new Date(dateRange.start);
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const variation = (Math.random() - 0.5) * 0.1 * baseValue;
        const trend = (i / days) * 0.05 * baseValue; // Slight upward trend
        
        data.push({
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.round((baseValue + variation + trend) * 100) / 100
        });
      }
      
      return data;
    };

    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    const accuracyData = generateTrendData(95.8, days);
    const volumeData = generateTrendData(1590, days);
    const performanceData = generateTrendData(1.2, days);

    return {
      accuracy_trend: {
        ...dataVisualizationService.analyzeTrend(accuracyData),
        data: accuracyData
      },
      volume_trend: {
        ...dataVisualizationService.analyzeTrend(volumeData),
        data: volumeData
      },
      performance_trend: {
        ...dataVisualizationService.analyzeTrend(performanceData),
        data: performanceData
      }
    };
  }

  private async generatePerformanceMetrics(
    activityData: ActivityItem[]
  ): Promise<PerformanceMetricsReport> {
    // Extract processing times
    const processingTimes = activityData
      .filter(activity => activity.processingTime)
      .map(activity => ({
        label: activity.timestamp.toISOString(),
        value: parseFloat(activity.processingTime!.replace('s', ''))
      }));

    // Calculate error rates by time period
    const errorRates = this.calculateErrorRatesByPeriod(activityData);

    // Calculate throughput (activities per hour)
    const throughputData = this.calculateThroughput(activityData);

    return {
      response_times: {
        ...dataVisualizationService.calculateStatistics(processingTimes),
        data: processingTimes
      },
      error_rates: {
        ...dataVisualizationService.calculateStatistics(errorRates),
        data: errorRates
      },
      throughput: {
        ...dataVisualizationService.calculateStatistics(throughputData),
        data: throughputData
      },
      availability: {
        uptime_percentage: 99.9,
        downtime_incidents: 2,
        mttr: 15 // minutes
      }
    };
  }

  private async generateActivityAnalysis(
    activityData: ActivityItem[]
  ): Promise<ActivityAnalysisReport> {
    const byStatus = dataVisualizationService.processActivityData(activityData, 'status');
    const byContext = dataVisualizationService.processActivityData(activityData, 'context');
    const byTimeOfDay = dataVisualizationService.processActivityData(activityData, 'time');

    // Calculate processing time statistics
    const processingTimes = activityData
      .filter(activity => activity.processingTime)
      .map(activity => ({
        label: activity.id,
        value: parseFloat(activity.processingTime!.replace('s', ''))
      }));

    const processingTimeAnalysis = processingTimes.length > 0 
      ? dataVisualizationService.calculateStatistics(processingTimes)
      : this.getEmptyStatistics();

    // Detect anomalies
    const anomalies = this.detectAnomalies(activityData);

    return {
      by_status: byStatus,
      by_context: byContext,
      by_time_of_day: byTimeOfDay,
      processing_time_analysis: processingTimeAnalysis,
      anomalies
    };
  }

  private async generateStatisticalSummary(
    kpiData: KPIData[],
    _activityData: ActivityItem[]
  ): Promise<StatisticalSummaryReport> {
    // Create overall statistics from KPI data
    const kpiValues = kpiData.map(kpi => ({
      label: kpi.title,
      value: this.normalizeKPIValue(kpi.value)
    }));

    const overallStatistics = kpiValues.length > 0 
      ? dataVisualizationService.calculateStatistics(kpiValues)
      : this.getEmptyStatistics();

    // Generate comparative analysis
    const comparativeAnalysis = {
      current_vs_previous: {
        period_comparison: 'vs. Previous Period',
        significant_changes: kpiData
          .filter(kpi => kpi.change && Math.abs(kpi.change.value) > 5)
          .map(kpi => ({
            metric: kpi.title,
            change_percent: kpi.change!.value,
            significance: Math.abs(kpi.change!.value) > 20 ? 'high' as const : 
                         Math.abs(kpi.change!.value) > 10 ? 'medium' as const : 'low' as const
          }))
      }
    };

    return {
      overall_statistics: overallStatistics,
      comparative_analysis: comparativeAnalysis
    };
  }

  private async generateRecommendations(
    kpiData: KPIData[],
    activityData: ActivityItem[],
    _reportData: ReportData
  ): Promise<RecommendationsReport> {
    const performanceRecommendations: RecommendationsReport['performance_recommendations'] = [];
    const dataQualityIssues: RecommendationsReport['data_quality_issues'] = [];

    // Analyze KPIs for recommendations
    const accuracy = kpiData.find(kpi => kpi.id === 'accuracy');
    if (accuracy && parseFloat(String(accuracy.value).replace('%', '')) < 95) {
      performanceRecommendations.push({
        category: 'accuracy' as const,
        priority: 'high' as const,
        title: 'Improve Analysis Accuracy',
        description: 'Current analysis accuracy is below the 95% target. Consider retraining models or improving data quality.',
        expected_impact: 'Increase accuracy by 2-5%',
        implementation_effort: 'medium' as const
      });
    }

    const processingTime = kpiData.find(kpi => kpi.id === 'processing_time');
    if (processingTime && parseFloat(String(processingTime.value).replace('s', '')) > 2.0) {
      performanceRecommendations.push({
        category: 'efficiency' as const,
        priority: 'medium' as const,
        title: 'Optimize Processing Performance',
        description: 'Processing times are above the 2-second target. Consider infrastructure upgrades or algorithm optimization.',
        expected_impact: 'Reduce processing time by 20-30%',
        implementation_effort: 'high' as const
      });
    }

    // Check for data quality issues
    const errorRate = activityData.filter(a => a.status === 'error').length / activityData.length;
    if (errorRate > 0.05) {
      dataQualityIssues.push({
        issue: 'High Error Rate',
        severity: 'critical' as const,
        affected_metrics: ['accuracy', 'reliability'],
        suggested_action: 'Investigate error patterns and implement additional validation'
      });
    }

    // Add general recommendations
    performanceRecommendations.push({
      category: 'user_experience' as const,
      priority: 'low' as const,
      title: 'Enhance User Feedback Collection',
      description: 'Implement more comprehensive user feedback mechanisms to better understand user satisfaction.',
      expected_impact: 'Improve user satisfaction insights',
      implementation_effort: 'low' as const
    });

    return {
      performance_recommendations: performanceRecommendations,
      data_quality_issues: dataQualityIssues
    };
  }

  // Export methods

  private exportAsJSON(reportData: ReportData): Blob {
    const json = JSON.stringify(reportData, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  private exportAsCSV(reportData: ReportData): Blob {
    let csv = 'Report Generated: ' + reportData.metadata.generated_at.toISOString() + '\n\n';
    
    // Export KPI data if available
    if (reportData.sections.kpi_overview) {
      csv += 'KPI Overview\n';
      csv += 'Name,Value,Change,Status,Trend\n';
      reportData.sections.kpi_overview.kpis.forEach(kpi => {
        csv += `${kpi.title},${kpi.value},${kpi.change?.value || 'N/A'},${kpi.status},${kpi.trend}\n`;
      });
      csv += '\n';
    }

    return new Blob([csv], { type: 'text/csv' });
  }

  private exportAsHTML(reportData: ReportData): Blob {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${reportData.metadata.title}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #4285f4; }
            h2 { color: #34a853; margin-top: 30px; }
            .kpi { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>${reportData.metadata.title}</h1>
        <p>Generated: ${reportData.metadata.generated_at.toLocaleString()}</p>
        <p>Period: ${reportData.metadata.date_range.start.toLocaleDateString()} - ${reportData.metadata.date_range.end.toLocaleDateString()}</p>
        
        ${reportData.sections.executive_summary ? `
        <h2>Executive Summary</h2>
        <h3>Key Highlights</h3>
        <ul>
            ${reportData.sections.executive_summary.key_highlights.map(highlight => `<li>${highlight}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${reportData.sections.kpi_overview ? `
        <h2>KPI Overview</h2>
        <div>
            ${reportData.sections.kpi_overview.kpis.map(kpi => `
                <div class="kpi">
                    <strong>${kpi.title}:</strong> ${kpi.value} 
                    ${kpi.change ? `(${kpi.change.value > 0 ? '+' : ''}${kpi.change.value}% ${kpi.change.period})` : ''}
                    - Status: ${kpi.status}, Trend: ${kpi.trend}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
    </body>
    </html>
    `;
    
    return new Blob([html], { type: 'text/html' });
  }

  private exportAsPDF(reportData: ReportData): Blob {
    // In a real implementation, this would use a PDF generation library
    // For now, return a placeholder
    const pdfContent = `PDF Report: ${reportData.metadata.title}\nGenerated: ${reportData.metadata.generated_at.toISOString()}`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  // Helper methods

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private compareKPIValue(value: string | number, target: number, kpiId: string): boolean {
    const numValue = this.normalizeKPIValue(value);
    
    // For error rates, lower is better
    if (kpiId.includes('error')) {
      return numValue <= target;
    }
    
    // For processing time, lower is better
    if (kpiId.includes('processing') || kpiId.includes('time')) {
      return numValue <= target;
    }
    
    // For most other metrics, higher is better
    return numValue >= target;
  }

  private normalizeKPIValue(value: string | number): number {
    if (typeof value === 'number') return value;
    
    const cleanValue = String(value).replace(/[%s,]/g, '');
    const parsed = parseFloat(cleanValue);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  private calculateErrorRatesByPeriod(activityData: ActivityItem[]): ChartDataPoint[] {
    // Group activities by hour and calculate error rates
    const hourlyGroups: Record<string, ActivityItem[]> = {};
    
    activityData.forEach(activity => {
      const hour = activity.timestamp.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      if (!hourlyGroups[hour]) {
        hourlyGroups[hour] = [];
      }
      hourlyGroups[hour].push(activity);
    });

    return Object.entries(hourlyGroups).map(([hour, activities]) => {
      const errorCount = activities.filter(a => a.status === 'error').length;
      const errorRate = (errorCount / activities.length) * 100;
      
      return {
        label: new Date(hour).toLocaleTimeString(),
        value: Math.round(errorRate * 100) / 100
      };
    });
  }

  private calculateThroughput(activityData: ActivityItem[]): ChartDataPoint[] {
    const hourlyGroups: Record<string, number> = {};
    
    activityData.forEach(activity => {
      const hour = activity.timestamp.toISOString().substring(0, 13);
      hourlyGroups[hour] = (hourlyGroups[hour] || 0) + 1;
    });

    return Object.entries(hourlyGroups).map(([hour, count]) => ({
      label: new Date(hour).toLocaleTimeString(),
      value: count
    }));
  }

  private detectAnomalies(activityData: ActivityItem[]): Array<{
    timestamp: Date;
    type: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }> {
    const anomalies: Array<{
      timestamp: Date;
      type: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
    }> = [];
    
    // Detect processing time anomalies
    const processingTimes = activityData
      .filter(a => a.processingTime)
      .map(a => parseFloat(a.processingTime!.replace('s', '')));
    
    if (processingTimes.length > 0) {
      const mean = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
      const stdDev = Math.sqrt(
        processingTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / processingTimes.length
      );
      
      activityData.forEach(activity => {
        if (activity.processingTime) {
          const time = parseFloat(activity.processingTime.replace('s', ''));
          if (Math.abs(time - mean) > 2 * stdDev) {
            anomalies.push({
              timestamp: activity.timestamp,
              type: 'Processing Time Anomaly',
              description: `Processing time ${time}s significantly exceeds normal range`,
              impact: time > mean + 2 * stdDev ? 'high' : 'medium'
            });
          }
        }
      });
    }

    return anomalies.slice(0, 10); // Return top 10 anomalies
  }

  private getEmptyStatistics(): StatisticalSummary {
    return {
      mean: 0,
      median: 0,
      mode: 0,
      standardDeviation: 0,
      variance: 0,
      min: 0,
      max: 0,
      range: 0,
      percentiles: {
        p25: 0,
        p50: 0,
        p75: 0,
        p90: 0,
        p95: 0
      }
    };
  }
}

// Create and export singleton instance
const analyticsReportingService = new AnalyticsReportingService();
export default analyticsReportingService;