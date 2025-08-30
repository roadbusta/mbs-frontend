/**
 * Bar Chart Component
 * 
 * SVG-based bar chart for displaying categorical data.
 * Features hover effects, tooltips, and responsive design.
 */

import React, { useState, useRef } from 'react';
import BaseChart, { ChartProps, ChartDataPoint } from './BaseChart';
import { useContainerDimensions } from '../../hooks/useContainerDimensions';
import './BarChart.css';

interface BarChartProps extends ChartProps {
  horizontal?: boolean;
  showValues?: boolean;
  barSpacing?: number;
  yAxisLabel?: string;
  xAxisLabel?: string;
  color?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  subtitle,
  loading,
  error,
  height = 300,
  className = '',
  horizontal = false,
  showValues = true,
  barSpacing = 0.2,
  showTooltips = true,
  yAxisLabel,
  xAxisLabel,
  color = '#4285f4',
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
  const margin = { top: 20, right: 30, bottom: 60, left: 80 };
  const chartWidth = Math.max(400, containerWidth - 40) - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scales
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(0, Math.min(...data.map(d => d.value))); // Include 0 in scale

  // Bar dimensions
  const barCount = data.length;
  const availableSpace = horizontal ? chartHeight : chartWidth;
  const totalSpacing = (barCount - 1) * barSpacing * (availableSpace / barCount);
  const barSize = (availableSpace - totalSpacing) / barCount;

  const getBarColor = (point: ChartDataPoint) => {
    return point.color || color;
  };

  // Scale functions
  const valueScale = (value: number) => {
    if (horizontal) {
      return ((value - minValue) / (maxValue - minValue)) * chartWidth;
    } else {
      return chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
    }
  };

  const positionScale = (index: number) => {
    if (horizontal) {
      return index * (barSize + (barSpacing * barSize));
    } else {
      return index * (barSize + (barSpacing * barSize));
    }
  };

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

  // Generate axis labels
  const generateAxisLabels = () => {
    const labels = [];
    
    if (horizontal) {
      // Y-axis labels (categories)
      data.forEach((point, index) => {
        const y = positionScale(index) + barSize / 2;
        labels.push(
          <text
            key={`y-label-${index}`}
            x={-10}
            y={y + 4}
            className="axis-label-text"
            textAnchor="end"
          >
            {point.label}
          </text>
        );
      });

      // X-axis labels (values)
      const tickCount = 5;
      for (let i = 0; i <= tickCount; i++) {
        const value = minValue + (i / tickCount) * (maxValue - minValue);
        const x = valueScale(value);
        
        labels.push(
          <g key={`x-tick-${i}`}>
            <line
              x1={x}
              y1={chartHeight}
              x2={x}
              y2={chartHeight + 5}
              className="axis-tick"
            />
            <text
              x={x}
              y={chartHeight + 20}
              className="axis-label-text"
              textAnchor="middle"
            >
              {Math.round(value)}
            </text>
          </g>
        );
      }
    } else {
      // X-axis labels (categories)
      data.forEach((point, index) => {
        const x = positionScale(index) + barSize / 2;
        labels.push(
          <text
            key={`x-label-${index}`}
            x={x}
            y={chartHeight + 20}
            className="axis-label-text"
            textAnchor="middle"
          >
            {point.label.length > 10 ? `${point.label.substring(0, 10)}...` : point.label}
          </text>
        );
      });

      // Y-axis labels (values)
      const tickCount = 5;
      for (let i = 0; i <= tickCount; i++) {
        const value = minValue + (i / tickCount) * (maxValue - minValue);
        const y = valueScale(value);
        
        labels.push(
          <g key={`y-tick-${i}`}>
            <line
              x1={-5}
              y1={y}
              x2={0}
              y2={y}
              className="axis-tick"
            />
            <text
              x={-10}
              y={y + 4}
              className="axis-label-text"
              textAnchor="end"
            >
              {Math.round(value)}
            </text>
          </g>
        );
      }
    }

    return labels;
  };

  const renderChart = () => (
    <div ref={containerRef} className="bar-chart-wrapper">
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth + margin.left + margin.right} ${height}`}
        className="bar-chart-svg"
        role="img"
        aria-label={title || 'Bar chart'}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Axis lines */}
          <line
            x1={0}
            y1={chartHeight}
            x2={horizontal ? chartWidth : 0}
            y2={horizontal ? chartHeight : 0}
            className="axis-line"
          />
          <line
            x1={0}
            y1={0}
            x2={horizontal ? 0 : chartWidth}
            y2={horizontal ? chartHeight : 0}
            className="axis-line"
          />
          
          {/* Grid lines */}
          {Array.from({ length: 5 }, (_, i) => {
            const value = minValue + (i / 4) * (maxValue - minValue);
            if (horizontal) {
              const x = valueScale(value);
              return (
                <line
                  key={`grid-${i}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={chartHeight}
                  className="grid-line"
                />
              );
            } else {
              const y = valueScale(value);
              return (
                <line
                  key={`grid-${i}`}
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  className="grid-line"
                />
              );
            }
          })}
          
          {/* Bars */}
          {data.map((point, index) => {
            const barColor = getBarColor(point);
            
            if (horizontal) {
              const barWidth = valueScale(point.value) - valueScale(0);
              const barHeight = barSize;
              const x = valueScale(0);
              const y = positionScale(index);
              
              return (
                <g key={`bar-${index}`}>
                  <rect
                    x={x}
                    y={y}
                    width={Math.max(0, barWidth)}
                    height={barHeight}
                    fill={barColor}
                    className="bar-rect"
                    onMouseMove={(e) => handleMouseMove(e, point)}
                    onMouseLeave={handleMouseLeave}
                  />
                  {showValues && (
                    <text
                      x={x + barWidth + 5}
                      y={y + barHeight / 2 + 4}
                      className="bar-value"
                      textAnchor="start"
                    >
                      {point.value}
                    </text>
                  )}
                </g>
              );
            } else {
              const barWidth = barSize;
              const barHeight = valueScale(0) - valueScale(point.value);
              const x = positionScale(index);
              const y = valueScale(point.value);
              
              return (
                <g key={`bar-${index}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(0, barHeight)}
                    fill={barColor}
                    className="bar-rect"
                    onMouseMove={(e) => handleMouseMove(e, point)}
                    onMouseLeave={handleMouseLeave}
                  />
                  {showValues && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      className="bar-value"
                      textAnchor="middle"
                    >
                      {point.value}
                    </text>
                  )}
                </g>
              );
            }
          })}
          
          {/* Axis labels */}
          {generateAxisLabels()}
        </g>
        
        {/* Axis titles */}
        {yAxisLabel && (
          <text
            x={20}
            y={height / 2}
            className="axis-title"
            textAnchor="middle"
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            {yAxisLabel}
          </text>
        )}
        
        {xAxisLabel && (
          <text
            x={400}
            y={height - 10}
            className="axis-title"
            textAnchor="middle"
          >
            {xAxisLabel}
          </text>
        )}
      </svg>
      
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="bar-chart-tooltip"
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
      className={`bar-chart-container ${horizontal ? 'bar-chart-container--horizontal' : ''} ${className}`}
      {...baseProps}
    >
      {renderChart()}
    </BaseChart>
  );
};

export default BarChart;