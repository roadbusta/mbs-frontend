/**
 * Dashboard Overview Component
 * 
 * Main dashboard page showing KPI cards and recent activity based on screenshots.
 * Features key metrics, processing activity, and system health status.
 * 
 * Features:
 * - KPI cards with metrics and trends
 * - Recent processing activity feed
 * - System health status indicators
 * - Responsive grid layout
 * - Real-time updates capability
 */

import React, { useState, useEffect } from 'react';
import KPIGrid from '../KPICards/KPIGrid';
import ActivityFeed, { ActivityItem } from '../ActivityFeed/ActivityFeed';
import { KPIData } from '../KPICards/KPICard';
import metricsService from '../../services/metricsService';
import activityService from '../../services/activityService';
import './DashboardOverview.css';

interface SystemHealthItem {
  id: string;
  name: string;
  status: 'online' | 'warning' | 'offline' | 'maintenance';
  description: string;
  lastCheck?: Date;
  uptime?: string;
}

const DashboardOverview: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  // Initialize dashboard data with real metrics service
  useEffect(() => {
    const initializeDashboardData = async () => {
      try {
        setIsLoading(true);
        setKpiError(null);
        
        // Load KPI data from metrics service
        const kpis = await metricsService.getKPIData();
        setKpiData(kpis);

        // Load recent activity data
        const activities = await activityService.getActivities({ limit: 10 });
        setRecentActivity(activities);

        // System Health Data
        const mockSystemHealth: SystemHealthItem[] = [
          {
            id: 'mbs-gateway',
            name: 'MBS Gateway',
            status: 'online',
            description: 'Response time: 45ms',
            lastCheck: new Date(Date.now() - 2 * 60 * 1000),
            uptime: '99.9%'
          },
          {
            id: 'analysis-engine',
            name: 'Analysis Engine',
            status: 'online',
            description: 'Processing queue: 2 items',
            lastCheck: new Date(Date.now() - 1 * 60 * 1000),
            uptime: '99.8%'
          },
          {
            id: 'mbs-database',
            name: 'MBS Database',
            status: 'online',
            description: 'Last updated: 2 hours ago',
            lastCheck: new Date(Date.now() - 3 * 60 * 1000),
            uptime: '100%'
          },
          {
            id: 'ml-models',
            name: 'ML Models',
            status: 'online',
            description: 'Model version: v2.1.4',
            lastCheck: new Date(Date.now() - 5 * 60 * 1000),
            uptime: '99.5%'
          }
        ];

        setSystemHealth(mockSystemHealth);
        setIsLoading(false);

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setKpiError(error instanceof Error ? error.message : 'Failed to load metrics');
        setIsLoading(false);
      }
    };

    initializeDashboardData();
    
    // Subscribe to real-time updates
    const unsubscribeKPIs = metricsService.subscribe((updatedKPIs) => {
      setKpiData(updatedKPIs);
    });
    
    const unsubscribeActivity = activityService.subscribe((updatedActivities) => {
      setRecentActivity(updatedActivities.slice(0, 10)); // Keep only latest 10 for dashboard
    });
    
    return () => {
      unsubscribeKPIs();
      unsubscribeActivity();
    };
  }, []);
  
  // Handle KPI card clicks
  const handleKPIClick = (kpi: KPIData) => {
    console.log('KPI clicked:', kpi.id);
    // TODO: Navigate to detailed KPI view or show modal
    // This could open a detailed view with charts and historical data
  };

  // Handle activity feed refresh
  const handleActivityRefresh = async () => {
    try {
      const activities = await activityService.getActivities({ limit: 10 });
      setRecentActivity(activities);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    }
  };

  // Handle activity feed load more
  const handleActivityLoadMore = async () => {
    try {
      const moreActivities = await activityService.getActivities({ 
        limit: 10, 
        offset: recentActivity.length 
      });
      setRecentActivity(prev => [...prev, ...moreActivities]);
    } catch (error) {
      console.error('Failed to load more activities:', error);
    }
  };

  // Format relative time for system health checks
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleDateString();
  };

  // Get status indicator for system health
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'online':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'offline':
        return '❌';
      case 'maintenance':
        return 'ℹ️';
      default:
        return '⚫';
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-overview">
        <div className="loading-state">
          <div className="loading-spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* KPI Cards Grid */}
      <section className="kpi-section" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="visually-hidden">Key Performance Indicators</h2>
        <KPIGrid 
          kpis={kpiData}
          onKPIClick={handleKPIClick}
          loading={isLoading}
          error={kpiError || undefined}
          gridSize="4"
        />
      </section>

      {/* Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Activity */}
        <section className="activity-section" aria-labelledby="activity-heading">
          <ActivityFeed
            activities={recentActivity}
            loading={isLoading}
            onRefresh={handleActivityRefresh}
            onLoadMore={handleActivityLoadMore}
            maxItems={10}
            className="dashboard-activity-feed"
          />
        </section>

        {/* System Health */}
        <section className="health-section" aria-labelledby="health-heading">
          <div className="section-header">
            <h2 id="health-heading">System Health</h2>
            <span className="health-summary">All systems operational</span>
          </div>
          
          <div className="health-grid">
            {systemHealth.map((system) => (
              <div key={system.id} className={`health-card ${system.status}`}>
                <div className="health-header">
                  <div className="health-status">
                    {getStatusIcon(system.status)}
                  </div>
                  <div className="health-info">
                    <h4 className="health-name">{system.name}</h4>
                    <p className="health-description">{system.description}</p>
                  </div>
                </div>
                
                {system.uptime && (
                  <div className="health-metrics">
                    <span className="uptime">Uptime: {system.uptime}</span>
                    {system.lastCheck && (
                      <span className="last-check">
                        Last check: {formatRelativeTime(system.lastCheck)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardOverview;