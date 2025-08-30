/**
 * Line Chart Component
 * 
 * SVG-based line chart for displaying trends over time.
 * Features smooth curves, data points, and interactive tooltips.
 */

import React, { useState, useRef, useCallback } from 'react';
import BaseChart, { ChartProps, ChartDataPoint } from './BaseChart';
import { useContainerDimensions } from '../../hooks/useContainerDimensions';
import './LineChart.css';

interface LineChartProps extends ChartProps {
  showDataPoints?: boolean;
  showGrid?: boolean;
  smooth?: boolean;
  strokeWidth?: number;
  fillArea?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  subtitle,
  loading,
  error,
  height = 300,
  className = '',
  showDataPoints = true,
  showGrid = true,
  smooth = true,
  strokeWidth = 2,
  fillArea = false,
  showTooltips = true,
  yAxisLabel,
  xAxisLabel,
  ...baseProps
}) => {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    data: ChartDataPoint;
  }>({ show: false, x: 0, y: 0, data: { label: '', value: 0 } });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth } = useContainerDimensions(containerRef);

  // Chart dimensions - responsive
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = Math.max(400, containerWidth - 40) - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scales
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  const padding = valueRange * 0.1;

  const yScale = (value: number) => {
    return chartHeight - ((value - minValue + padding) / (valueRange + 2 * padding)) * chartHeight;
  };

  const xScale = (index: number) => {
    return (index / (data.length - 1)) * chartWidth;
  };

  // Generate path for line
  const generatePath = useCallback(() => {
    if (data.length === 0) return '';

    let path = `M ${xScale(0)} ${yScale(data[0].value)}`;

    if (smooth && data.length > 2) {
      // Create smooth curve using quadratic Bézier curves
      for (let i = 1; i < data.length; i++) {
        const prevX = xScale(i - 1);
        const prevY = yScale(data[i - 1].value);
        const currentX = xScale(i);
        const currentY = yScale(data[i].value);
        
        // Control points for smooth curve
        const controlX1 = prevX + (currentX - prevX) / 3;
        const controlY1 = prevY;
        const controlX2 = prevX + 2 * (currentX - prevX) / 3;
        const controlY2 = currentY;
        
        path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${currentX} ${currentY}`;
      }
    } else {
      // Simple line-to commands
      for (let i = 1; i < data.length; i++) {
        path += ` L ${xScale(i)} ${yScale(data[i].value)}`;
      }
    }

    return path;
  }, [data, smooth, chartWidth, chartHeight, minValue, valueRange]);

  // Generate area fill path
  const generateAreaPath = useCallback(() => {
    if (!fillArea || data.length === 0) return '';

    const linePath = generatePath();
    const firstX = xScale(0);
    const lastX = xScale(data.length - 1);
    const bottomY = chartHeight;

    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [generatePath, fillArea, data.length, chartHeight]);

  // Handle mouse events for tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGElement>, dataPoint: ChartDataPoint) => {
    if (!showTooltips) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltip({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      data: dataPoint
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  // Generate grid lines
  const generateGridLines = () => {
    if (!showGrid) return null;

    const lines = [];
    const gridCount = 5;

    // Horizontal grid lines
    for (let i = 0; i <= gridCount; i++) {
      const y = (i / gridCount) * chartHeight;
      const value = maxValue + padding - (i / gridCount) * (valueRange + 2 * padding);
      
      lines.push(
        <g key={`h-grid-${i}`}>
          <line
            x1={0}
            y1={y}
            x2={chartWidth}
            y2={y}
            className="grid-line"
          />
          <text
            x={-10}
            y={y + 4}
            className="grid-label"
            textAnchor="end"
          >
            {Math.round(value)}
          </text>
        </g>
      );
    }

    // Vertical grid lines
    const step = Math.max(1, Math.floor(data.length / 6));
    for (let i = 0; i < data.length; i += step) {
      const x = xScale(i);
      
      lines.push(
        <g key={`v-grid-${i}`}>
          <line
            x1={x}
            y1={0}
            x2={x}
            y2={chartHeight}
            className="grid-line"
          />
          <text
            x={x}
            y={chartHeight + 15}
            className="grid-label"
            textAnchor="middle"
          >
            {data[i].label}
          </text>
        </g>
      );
    }

    return lines;
  };

  const renderChart = () => (
    <div ref={containerRef} className="line-chart-wrapper">
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth + margin.left + margin.right} ${height}`}
        className="line-chart-svg"
        role="img"
        aria-label={title || 'Line chart'}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {generateGridLines()}
          
          {/* Area fill */}
          {fillArea && (
            <path
              d={generateAreaPath()}
              className="line-chart-area"
              fill="url(#areaGradient)"
              opacity={0.3}
            />
          )}
          
          {/* Main line */}
          <path
            d={generatePath()}
            className="line-chart-path"
            fill="none"
            stroke={data[0]?.color || '#4285f4'}
            strokeWidth={strokeWidth}
          />
          
          {/* Data points */}
          {showDataPoints && data.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={xScale(index)}
              cy={yScale(point.value)}
              r={4}
              className="line-chart-point"
              fill={point.color || '#4285f4'}
              onMouseMove={(e) => handleMouseMove(e, point)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={data[0]?.color || '#4285f4'} stopOpacity={0.3} />
              <stop offset="100%" stopColor={data[0]?.color || '#4285f4'} stopOpacity={0} />
            </linearGradient>
          </defs>
        </g>
        
        {/* Axis labels */}
        {yAxisLabel && (
          <text
            x={20}
            y={height / 2}
            className="axis-label"
            textAnchor="middle"
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            {yAxisLabel}
          </text>
        )}
        
        {xAxisLabel && (
          <text
            x={(chartWidth + margin.left + margin.right) / 2}
            y={height - 10}
            className="axis-label"
            textAnchor="middle"
          >
            {xAxisLabel}
          </text>
        )}
      </svg>
      
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="line-chart-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
        >
          <strong>{tooltip.data.label}</strong><br />
          Value: {tooltip.data.value.toLocaleString()}
        </div>
      )}
    </div>
  );

  return (
    <BaseChart
      data={data}
      title={title}
      subtitle={subtitle}
      loading={loading}
      error={error}
      height={height}
      className={`line-chart-container ${className}`}
      {...baseProps}
    >
      {renderChart()}
    </BaseChart>
  );
};

export default LineChart;