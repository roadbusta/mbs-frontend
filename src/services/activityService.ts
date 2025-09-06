/**
 * Activity Service
 * 
 * Service for managing and fetching real-time activity data.
 * Provides mock data for development and interfaces for real API integration.
 */

import { ActivityItem } from '../components/ActivityFeed/ActivityFeed';
import { apiClient } from './apiClient';

export interface ActivityFilters {
  status?: 'all' | 'success' | 'warning' | 'error' | 'info';
  action?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityStats {
  total: number;
  success: number;
  warning: number;
  error: number;
  info: number;
  todayCount: number;
  averageProcessingTime: number;
}

class ActivityService {
  private baseUrl = import.meta.env.VITE_API_URL || '';
  private activities: ActivityItem[] = [];
  private subscribers: Array<(activities: ActivityItem[]) => void> = [];
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMockData();
  }

  /**
   * Get activities with optional filtering
   */
  async getActivities(filters?: ActivityFilters): Promise<ActivityItem[]> {
    try {
      // Try real API first if enabled
      if (apiClient.isRealApiEnabled) {
        console.log('🔄 Fetching activity data from real API...');
        const response = await apiClient.post<{activities: ActivityItem[], pagination?: any}>('/api/activities', filters, {
          cache: false // Don't cache activities as they change frequently
        });

        if (response.success && response.data?.activities) {
          console.log('✅ Real activity data loaded successfully');
          return response.data.activities;
        } else {
          console.warn('⚠️ Real API returned invalid activity data, falling back to mock');
        }
      }

      // Fallback to mock data (always available)
      console.log('📊 Using mock activity data');
      return this.getFilteredMockData(filters);
    } catch (error) {
      console.error('❌ Failed to fetch activities:', error);
      // Graceful degradation - always return mock data on failure
      return this.getFilteredMockData(filters);
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(): Promise<ActivityStats> {
    try {
      // In production, this would fetch from your API
      // const response = await fetch(`${this.baseUrl}/api/activities/stats`);
      // return await response.json();

      return this.getMockActivityStats();
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
      throw new Error('Failed to load activity statistics');
    }
  }

  /**
   * Subscribe to real-time activity updates
   */
  subscribe(callback: (activities: ActivityItem[]) => void): () => void {
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
   * Add a new activity (for real-time updates)
   */
  addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.activities.unshift(newActivity);
    
    // Keep only the latest 1000 activities
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(0, 1000);
    }

    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Clear all activities
   */
  clearActivities(): void {
    this.activities = [];
    this.notifySubscribers();
  }

  /**
   * Start polling for updates
   */
  private startPolling(): void {
    this.refreshInterval = setInterval(() => {
      // In development, simulate new activities
      if (import.meta.env.DEV) {
        this.simulateNewActivity();
      }
      this.notifySubscribers();
    }, 15000); // Check every 15 seconds
  }

  /**
   * Stop polling for updates
   */
  private stopPolling(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Notify all subscribers of updates
   */
  private notifySubscribers(): void {
    const recentActivities = this.activities.slice(0, 50); // Send latest 50 activities
    this.subscribers.forEach(callback => callback(recentActivities));
  }

  /**
   * Initialize mock data
   */
  private initializeMockData(): void {
    const mockActivities: ActivityItem[] = [
      {
        id: 'activity_1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        action: 'Consultation Analysis',
        details: 'Patient presented with acute respiratory symptoms. Recommended codes: 23, 36, 721.',
        status: 'success',
        processingTime: '1.1s',
        context: 'General Practice'
      },
      {
        id: 'activity_2',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        action: 'Bulk Code Analysis',
        details: 'Routine diabetes follow-up consultation. Applied standard diabetes management codes.',
        status: 'success',
        processingTime: '0.9s',
        context: 'Endocrinology'
      },
      {
        id: 'activity_3',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        action: 'System Health Check',
        details: 'Automated system health verification completed successfully.',
        status: 'info',
        context: 'System'
      },
      {
        id: 'activity_4',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        action: 'Model Training Update',
        details: 'ML model retrained with latest MBS updates. Accuracy improved by 0.3%.',
        status: 'success',
        context: 'Machine Learning'
      },
      {
        id: 'activity_5',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        action: 'Consultation Analysis',
        details: 'Mental health consultation analysis with complex symptom presentation.',
        status: 'warning',
        processingTime: '2.1s',
        context: 'Psychiatry'
      },
      {
        id: 'activity_6',
        timestamp: new Date(Date.now() - 55 * 60 * 1000),
        action: 'Data Export',
        details: 'Monthly compliance report generated and exported to PDF.',
        status: 'success',
        context: 'Reporting'
      },
      {
        id: 'activity_7',
        timestamp: new Date(Date.now() - 65 * 60 * 1000),
        action: 'API Rate Limit',
        details: 'Rate limit temporarily exceeded. Processing resumed after cooldown.',
        status: 'warning',
        context: 'System'
      },
      {
        id: 'activity_8',
        timestamp: new Date(Date.now() - 75 * 60 * 1000),
        action: 'Consultation Analysis',
        details: 'Cardiology consultation processed with high confidence recommendations.',
        status: 'success',
        processingTime: '1.3s',
        context: 'Cardiology'
      },
      {
        id: 'activity_9',
        timestamp: new Date(Date.now() - 85 * 60 * 1000),
        action: 'Database Backup',
        details: 'Automated database backup completed successfully.',
        status: 'info',
        context: 'System'
      },
      {
        id: 'activity_10',
        timestamp: new Date(Date.now() - 95 * 60 * 1000),
        action: 'User Session Timeout',
        details: 'User session expired due to inactivity. Auto-saved draft consultation.',
        status: 'info',
        context: 'Security'
      }
    ];

    this.activities = mockActivities;
  }

  /**
   * Get filtered mock data
   */
  private getFilteredMockData(filters?: ActivityFilters): ActivityItem[] {
    let filtered = [...this.activities];

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(activity => activity.status === filters.status);
    }

    if (filters?.action) {
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(filters.action!.toLowerCase())
      );
    }

    if (filters?.dateRange) {
      filtered = filtered.filter(activity =>
        activity.timestamp >= filters.dateRange!.start &&
        activity.timestamp <= filters.dateRange!.end
      );
    }

    if (filters?.userId) {
      filtered = filtered.filter(activity => activity.userId === filters.userId);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return filtered.slice(offset, offset + limit);
  }

  /**
   * Get mock activity statistics
   */
  private getMockActivityStats(): ActivityStats {
    const activities = this.activities;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = activities.filter(activity => 
      activity.timestamp >= today
    );

    const processingTimes = activities
      .filter(activity => activity.processingTime)
      .map(activity => parseFloat(activity.processingTime!.replace('s', '')));

    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    return {
      total: activities.length,
      success: activities.filter(a => a.status === 'success').length,
      warning: activities.filter(a => a.status === 'warning').length,
      error: activities.filter(a => a.status === 'error').length,
      info: activities.filter(a => a.status === 'info').length,
      todayCount: todayActivities.length,
      averageProcessingTime: Math.round(avgProcessingTime * 100) / 100
    };
  }

  /**
   * Simulate new activity for development
   */
  private simulateNewActivity(): void {
    if (Math.random() > 0.7) { // 30% chance of new activity
      const actions = [
        'Consultation Analysis',
        'System Health Check',
        'Data Export',
        'Model Training Update',
        'User Login',
        'Bulk Code Analysis'
      ];

      const statuses: Array<'success' | 'warning' | 'error' | 'info'> = [
        'success', 'success', 'success', 'success', // Bias towards success
        'info', 'info',
        'warning',
        'error'
      ];

      const contexts = [
        'General Practice',
        'Cardiology',
        'Endocrinology',
        'Psychiatry',
        'System',
        'Reporting'
      ];

      const action = actions[Math.floor(Math.random() * actions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const context = contexts[Math.floor(Math.random() * contexts.length)];

      this.addActivity({
        action,
        details: `Simulated ${action.toLowerCase()} activity for testing purposes.`,
        status,
        processingTime: action.includes('Analysis') ? `${(Math.random() * 2 + 0.5).toFixed(1)}s` : undefined,
        context
      });
    }
  }
}

// Create and export a singleton instance
const activityService = new ActivityService();
export default activityService;