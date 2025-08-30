/**
 * KPI Card Component
 * 
 * Individual card component for displaying key performance indicators
 * with trend indicators, tooltips, and click actions.
 */

import React from 'react';
import './KPICard.css';

export interface KPIData {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  description?: string;
  target?: number;
  unit?: string;
  trend?: Array<{
    date: string;
    value: number;
  }>;
}

interface KPICardProps {
  data: KPIData;
  size?: 'small' | 'medium' | 'large';
  onClick?: (kpi: KPIData) => void;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  data, 
  size = 'medium', 
  onClick, 
  className = '' 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  const getChangeIcon = () => {
    if (!data.change) return '';
    
    switch (data.change.type) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  const getChangeClass = () => {
    if (!data.change) return '';
    return `kpi-change-${data.change.type}`;
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    }
    return value;
  };

  const getProgressPercentage = () => {
    if (!data.target || typeof data.value !== 'number') return 0;
    return Math.min((data.value / data.target) * 100, 100);
  };

  return (
    <div 
      className={`kpi-card kpi-card--${size} kpi-card--${data.color} ${onClick ? 'kpi-card--clickable' : ''} ${className}`}
      onClick={handleClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      title={data.description}
    >
      <div className="kpi-card__header">
        <div className="kpi-card__icon">
          <span className="icon">{data.icon}</span>
        </div>
        <div className="kpi-card__title">
          {data.title}
        </div>
      </div>

      <div className="kpi-card__content">
        <div className="kpi-card__value">
          <span className="value">{formatValue(data.value)}</span>
          {data.unit && <span className="unit">{data.unit}</span>}
        </div>

        {data.change && (
          <div className={`kpi-card__change ${getChangeClass()}`}>
            <span className="change-icon">{getChangeIcon()}</span>
            <span className="change-value">
              {data.change.value > 0 ? '+' : ''}{data.change.value}%
            </span>
            <span className="change-period">
              vs {data.change.period}
            </span>
          </div>
        )}

        {data.target && typeof data.value === 'number' && (
          <div className="kpi-card__progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="progress-text">
              {data.value} / {data.target}
            </div>
          </div>
        )}
      </div>

      {onClick && (
        <div className="kpi-card__footer">
          <span className="kpi-card__action">
            Click for details →
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;