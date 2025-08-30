/**
 * KPI Grid Component
 * 
 * Grid layout component for organizing multiple KPI cards
 * with responsive design and loading states.
 */

import React from 'react';
import KPICard, { KPIData } from './KPICard';
import './KPIGrid.css';

interface KPIGridProps {
  kpis: KPIData[];
  onKPIClick?: (kpi: KPIData) => void;
  loading?: boolean;
  error?: string;
  className?: string;
  gridSize?: 'auto' | '2' | '3' | '4';
}

const KPIGrid: React.FC<KPIGridProps> = ({
  kpis,
  onKPIClick,
  loading = false,
  error,
  className = '',
  gridSize = 'auto'
}) => {
  if (error) {
    return (
      <div className="kpi-grid-error">
        <div className="kpi-grid-error__icon">⚠️</div>
        <div className="kpi-grid-error__message">
          <h3>Unable to Load KPIs</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`kpi-grid kpi-grid--${gridSize} kpi-grid--loading ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="kpi-card-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-icon"></div>
              <div className="skeleton-title"></div>
            </div>
            <div className="skeleton-value"></div>
            <div className="skeleton-change"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpis || kpis.length === 0) {
    return (
      <div className="kpi-grid-empty">
        <div className="kpi-grid-empty__icon">📊</div>
        <div className="kpi-grid-empty__message">
          <h3>No KPIs Available</h3>
          <p>No key performance indicators are currently available to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`kpi-grid kpi-grid--${gridSize} ${className}`}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          data={kpi}
          onClick={onKPIClick}
        />
      ))}
    </div>
  );
};

export default KPIGrid;