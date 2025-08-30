/**
 * Activity Feed Component
 * 
 * Real-time activity feed showing processing activities, system events,
 * and user interactions with pagination and filtering capabilities.
 */

import React, { useState } from 'react';
import './ActivityFeed.css';

export interface ActivityItem {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'error' | 'info';
  processingTime?: string;
  userId?: string;
  context?: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  showFilters?: boolean;
  maxItems?: number;
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  error,
  onLoadMore,
  onRefresh,
  showFilters = false,
  maxItems = 10,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'warning' | 'error' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter activities based on current filters
  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.status === filter;
    const matchesSearch = searchQuery === '' || 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).slice(0, maxItems);

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get status icon and color
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '⚫';
    }
  };

  // Get action icon based on activity type
  const getActionIcon = (action: string): string => {
    if (action.includes('Analysis') || action.includes('Consultation')) return '🔍';
    if (action.includes('Export') || action.includes('Download')) return '📥';
    if (action.includes('Upload') || action.includes('Import')) return '📤';
    if (action.includes('Training') || action.includes('Model')) return '🧠';
    if (action.includes('System') || action.includes('Update')) return '🔧';
    if (action.includes('User') || action.includes('Login')) return '👤';
    return '📊';
  };

  if (error) {
    return (
      <div className={`activity-feed activity-feed--error ${className}`}>
        <div className="activity-feed__error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Unable to Load Activity Feed</h3>
            <p>{error}</p>
            {onRefresh && (
              <button 
                className="retry-button"
                onClick={onRefresh}
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

  return (
    <div className={`activity-feed ${className}`}>
      <div className="activity-feed__header">
        <div className="activity-feed__title">
          <h3>Recent Processing Activity</h3>
          {onRefresh && (
            <button 
              className="refresh-button"
              onClick={onRefresh}
              disabled={loading}
              type="button"
              title="Refresh activity feed"
            >
              🔄
            </button>
          )}
        </div>

        {showFilters && (
          <div className="activity-feed__filters">
            <div className="filter-group">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="filter-select"
              >
                <option value="all">All Activities</option>
                <option value="success">Success</option>
                <option value="warning">Warnings</option>
                <option value="error">Errors</option>
                <option value="info">Info</option>
              </select>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="search-input"
              />
            </div>
          </div>
        )}
      </div>

      <div className="activity-feed__content">
        {loading && filteredActivities.length === 0 ? (
          <div className="activity-feed__loading">
            <div className="loading-spinner"></div>
            <p>Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="activity-feed__empty">
            <div className="empty-icon">📭</div>
            <h4>No Activities</h4>
            <p>
              {filter !== 'all' || searchQuery 
                ? 'No activities match your current filters.' 
                : 'No recent processing activities to display.'
              }
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={`activity-item activity-item--${activity.status}`}
                role="article"
              >
                <div className="activity-item__timeline">
                  <div className="timeline-dot">
                    {getStatusIcon(activity.status)}
                  </div>
                </div>

                <div className="activity-item__content">
                  <div className="activity-item__header">
                    <div className="activity-action">
                      <span className="action-icon">
                        {getActionIcon(activity.action)}
                      </span>
                      <span className="action-text">
                        {activity.action}
                      </span>
                    </div>
                    <time 
                      className="activity-time"
                      dateTime={activity.timestamp.toISOString()}
                      title={activity.timestamp.toLocaleString()}
                    >
                      {formatRelativeTime(activity.timestamp)}
                    </time>
                  </div>

                  <div className="activity-item__details">
                    <p>{activity.details}</p>
                  </div>

                  {(activity.processingTime || activity.context) && (
                    <div className="activity-item__metadata">
                      {activity.processingTime && (
                        <span className="metadata-item">
                          ⏱️ {activity.processingTime}
                        </span>
                      )}
                      {activity.context && (
                        <span className="metadata-item">
                          📍 {activity.context}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {onLoadMore && filteredActivities.length >= maxItems && (
          <div className="activity-feed__footer">
            <button 
              className="load-more-button"
              onClick={onLoadMore}
              disabled={loading}
              type="button"
            >
              {loading ? 'Loading...' : 'Load More Activities'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;