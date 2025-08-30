/**
 * Metrics Service
 * 
 * Service for fetching and managing real-time KPI metrics data.
 * Provides mock data for development and interfaces for real API integration.
 */

import { KPIData } from '../components/KPICards/KPICard';

export interface MetricsData {
  accuracy: number;
  processingTime: number;
  totalAnalyses: number;
  errorRate: number;
  dailyVolume: number;
  userSatisfaction: number;
  systemHealth: number;
  responseTime: number;
}

export interface SystemStatus {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastUpdate: string;
  services: {
    api: 'online' | 'offline' | 'degraded';
    database: 'online' | 'offline' | 'degraded';
    cache: 'online' | 'offline' | 'degraded';
  };
}

class MetricsService {
  private baseUrl = import.meta.env.VITE_API_URL || '';
  private refreshInterval: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: KPIData[]) => void> = [];

  /**
   * Get current KPI data
   */
  async getKPIData(): Promise<KPIData[]> {
    try {
      // In production, this would fetch from your API
      // const response = await fetch(`${this.baseUrl}/api/metrics/kpis`);
      // return await response.json();

      // For now, return enhanced mock data based on screenshots
      return this.getMockKPIData();
    } catch (error) {
      console.error('Failed to fetch KPI data:', error);
      throw new Error('Failed to load metrics data');
    }
  }

  /**
   * Get system status information
   */
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // In production, this would fetch from your API
      // const response = await fetch(`${this.baseUrl}/api/system/status`);
      // return await response.json();

      return this.getMockSystemStatus();
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      throw new Error('Failed to load system status');
    }
  }

  /**
   * Get detailed metrics for a specific KPI
   */
  async getKPIDetails(kpiId: string): Promise<{
    id: string;
    history: Array<{ date: string; value: number }>;
    breakdown: Record<string, number>;
    target: number;
    description: string;
  }> {
    try {
      // In production, this would fetch from your API
      // const response = await fetch(`${this.baseUrl}/api/metrics/kpis/${kpiId}`);
      // return await response.json();

      return this.getMockKPIDetails(kpiId);
    } catch (error) {
      console.error('Failed to fetch KPI details:', error);
      throw new Error('Failed to load KPI details');
    }
  }

  /**
   * Subscribe to real-time KPI updates
   */
  subscribe(callback: (data: KPIData[]) => void): () => void {
    this.subscribers.push(callback);

    // Start polling if this is the first subscriber
    if (this.subscribers.length === 1) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }

      // Stop polling if no subscribers
      if (this.subscribers.length === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * Start polling for updates
   */
  private startPolling() {
    this.refreshInterval = setInterval(async () => {
      try {
        const data = await this.getKPIData();
        this.subscribers.forEach(callback => callback(data));
      } catch (error) {
        console.error('Failed to refresh KPI data:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  /**
   * Stop polling for updates
   */
  private stopPolling() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Generate mock KPI data based on screenshot requirements
   */
  private getMockKPIData(): KPIData[] {
    const now = new Date();
    const baseAccuracy = 95.8;
    const baseProcessingTime = 1.2;
    const baseAnalyses = 1590;
    const baseErrorRate = 0.8;

    // Add some realistic variation
    const variation = () => (Math.random() - 0.5) * 0.1;

    return [
      {
        id: 'accuracy',
        title: 'Analysis Accuracy',
        value: `${(baseAccuracy + variation()).toFixed(1)}%`,
        change: {
          value: 2.3,
          type: 'increase',
          period: 'last week'
        },
        icon: '🎯',
        color: 'green',
        description: 'Percentage of accurate MBS code recommendations',
        target: 98,
        trend: this.generateTrendData(baseAccuracy, 7)
      },
      {
        id: 'processing_time',
        title: 'Avg Processing Time',
        value: (baseProcessingTime + variation()).toFixed(1),
        unit: 's',
        change: {
          value: -5.2,
          type: 'decrease',
          period: 'last week'
        },
        icon: '⚡',
        color: 'blue',
        description: 'Average time to process consultation notes',
        target: 1.0,
        trend: this.generateTrendData(baseProcessingTime, 7)
      },
      {
        id: 'total_analyses',
        title: 'Total Analyses',
        value: Math.floor(baseAnalyses + (Math.random() * 50)),
        change: {
          value: 12.8,
          type: 'increase',
          period: 'this month'
        },
        icon: '📊',
        color: 'purple',
        description: 'Total consultation analyses completed',
        trend: this.generateTrendData(baseAnalyses, 30)
      },
      {
        id: 'error_rate',
        title: 'Error Rate',
        value: `${(baseErrorRate + variation()).toFixed(1)}%`,
        change: {
          value: -1.5,
          type: 'decrease',
          period: 'last week'
        },
        icon: '🚨',
        color: 'red',
        description: 'Percentage of failed analysis requests',
        target: 0.5,
        trend: this.generateTrendData(baseErrorRate, 7)
      },
      {
        id: 'daily_volume',
        title: 'Daily Volume',
        value: Math.floor(150 + (Math.random() * 30)),
        change: {
          value: 8.4,
          type: 'increase',
          period: 'yesterday'
        },
        icon: '📈',
        color: 'orange',
        description: 'Number of analyses processed today',
        trend: this.generateTrendData(150, 7)
      },
      {
        id: 'user_satisfaction',
        title: 'User Satisfaction',
        value: '4.8',
        unit: '/5',
        change: {
          value: 3.2,
          type: 'increase',
          period: 'last month'
        },
        icon: '⭐',
        color: 'green',
        description: 'Average user satisfaction rating',
        target: 5.0,
        trend: this.generateTrendData(4.8, 30)
      }
    ];
  }

  /**
   * Generate mock system status
   */
  private getMockSystemStatus(): SystemStatus {
    return {
      status: 'healthy',
      uptime: 99.9,
      lastUpdate: new Date().toISOString(),
      services: {
        api: 'online',
        database: 'online',
        cache: 'online'
      }
    };
  }

  /**
   * Generate mock KPI details
   */
  private getMockKPIDetails(kpiId: string): any {
    return {
      id: kpiId,
      history: this.generateTrendData(Math.random() * 100, 30),
      breakdown: {
        'General Practice': 45,
        'Specialist': 30,
        'Emergency': 15,
        'Other': 10
      },
      target: 100,
      description: `Detailed information about ${kpiId} metric`
    };
  }

  /**
   * Generate trend data for charts
   */
  private generateTrendData(baseValue: number, days: number): Array<{ date: string; value: number }> {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 0.2 * baseValue;
      const value = Math.max(0, baseValue + variation);

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }

    return data;
  }

  /**
   * Simulate real-time updates for development
   */
  simulateRealTimeUpdates(): void {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        this.subscribers.forEach(async (callback) => {
          try {
            const data = await this.getKPIData();
            callback(data);
          } catch (error) {
            console.error('Failed to simulate real-time update:', error);
          }
        });
      }, 60000); // Update every minute in development
    }
  }
}

// Create and export a singleton instance
const metricsService = new MetricsService();
export default metricsService;