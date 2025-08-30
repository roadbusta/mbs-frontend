/**
 * Donut Chart Component
 * 
 * SVG-based donut chart for displaying proportional data.
 * Features animations, hover effects, and center text display.
 */

import React, { useState, useRef } from 'react';
import BaseChart, { ChartProps, ChartDataPoint } from './BaseChart';
import { useContainerDimensions } from '../../hooks/useContainerDimensions';
import './DonutChart.css';

interface DonutChartProps extends ChartProps {
  innerRadius?: number;
  outerRadius?: number;
  showCenterText?: boolean;
  centerText?: string;
  centerSubtext?: string;
  showPercentages?: boolean;
  startAngle?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  subtitle,
  loading,
  error,
  height = 300,
  className = '',
  innerRadius = 60,
  outerRadius = 100,
  showCenterText = true,
  centerText,
  centerSubtext,
  showPercentages = true,
  startAngle = 0,
  showTooltips = true,
  showLegend = true,
  ...baseProps
}) => {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    data: ChartDataPoint;
  }>({ show: false, x: 0, y: 0, data: { label: '', value: 0 } });
  
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth } = useContainerDimensions(containerRef);

  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }));

  // Chart dimensions - responsive
  const chartSize = Math.min(containerWidth - 40, height - 40, 400);
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const responsiveOuterRadius = Math.min(outerRadius, chartSize / 2 - 20);
  const responsiveInnerRadius = Math.min(innerRadius, responsiveOuterRadius - 30);

  // Default colors
  const defaultColors = [
    '#4285f4', '#34a853', '#ff9800', '#ea4335', '#9c27b0',
    '#00bcd4', '#8bc34a', '#ffc107', '#e91e63', '#607d8b'
  ];

  // Generate arc path
  const generateArcPath = (
    startAngle: number,
    endAngle: number,
    innerRad: number,
    outerRad: number
  ): string => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + innerRad * Math.cos(startAngleRad);
    const y1 = centerY + innerRad * Math.sin(startAngleRad);
    const x2 = centerX + outerRad * Math.cos(startAngleRad);
    const y2 = centerY + outerRad * Math.sin(startAngleRad);
    const x3 = centerX + outerRad * Math.cos(endAngleRad);
    const y3 = centerY + outerRad * Math.sin(endAngleRad);
    const x4 = centerX + innerRad * Math.cos(endAngleRad);
    const y4 = centerY + innerRad * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      'M', x1, y1,
      'L', x2, y2,
      'A', outerRad, outerRad, 0, largeArcFlag, 1, x3, y3,
      'L', x4, y4,
      'A', innerRad, innerRad, 0, largeArcFlag, 0, x1, y1,
      'Z'
    ].join(' ');
  };

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<SVGElement>, dataPoint: ChartDataPoint, index: number) => {
    if (!showTooltips) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltip({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      data: dataPoint
    });
    setHoveredSegment(index);
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
    setHoveredSegment(null);
  };

  // Generate segments
  const generateSegments = () => {
    let currentAngle = startAngle;
    
    return dataWithPercentages.map((item, index) => {
      const segmentAngle = (item.value / total) * 360;
      const color = item.color || defaultColors[index % defaultColors.length];
      const isHovered = hoveredSegment === index;
      const segmentInnerRadius = isHovered ? responsiveInnerRadius - 2 : responsiveInnerRadius;
      const segmentOuterRadius = isHovered ? responsiveOuterRadius + 8 : responsiveOuterRadius;

      const path = generateArcPath(
        currentAngle,
        currentAngle + segmentAngle,
        segmentInnerRadius,
        segmentOuterRadius
      );

      const segment = (
        <path
          key={`segment-${index}`}
          d={path}
          fill={color}
          className={`donut-segment ${isHovered ? 'donut-segment--hovered' : ''}`}
          onMouseMove={(e) => handleMouseMove(e, item, index)}
          onMouseLeave={handleMouseLeave}
          style={{
            transformOrigin: `${centerX}px ${centerY}px`
          }}
        />
      );

      currentAngle += segmentAngle;
      return segment;
    });
  };

  // Generate labels
  const generateLabels = () => {
    if (!showPercentages) return null;

    let currentAngle = startAngle;
    
    return dataWithPercentages.map((item, index) => {
      const segmentAngle = (item.value / total) * 360;
      const labelAngle = currentAngle + segmentAngle / 2;
      const labelAngleRad = (labelAngle - 90) * (Math.PI / 180);
      
      const labelRadius = (responsiveInnerRadius + responsiveOuterRadius) / 2;
      const x = centerX + labelRadius * Math.cos(labelAngleRad);
      const y = centerY + labelRadius * Math.sin(labelAngleRad);

      currentAngle += segmentAngle;

      // Only show label if segment is large enough
      if (item.percentage < 5) return null;

      return (
        <text
          key={`label-${index}`}
          x={x}
          y={y + 4}
          className="donut-label"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="600"
        >
          {item.percentage.toFixed(0)}%
        </text>
      );
    });
  };

  // Generate legend
  const generateLegend = () => {
    if (!showLegend) return null;

    return (
      <div className="donut-legend">
        {dataWithPercentages.map((item, index) => {
          const color = item.color || defaultColors[index % defaultColors.length];
          return (
            <div
              key={`legend-${index}`}
              className={`legend-item ${hoveredSegment === index ? 'legend-item--active' : ''}`}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className="legend-color"
                style={{ backgroundColor: color }}
              />
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">
                {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChart = () => (
    <div ref={containerRef} className="donut-chart-wrapper">
      <div className="donut-chart-content">
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${chartSize} ${chartSize}`}
          className="donut-chart-svg"
          role="img"
          aria-label={title || 'Donut chart'}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Segments */}
          {generateSegments()}
          
          {/* Labels */}
          {generateLabels()}
          
          {/* Center text */}
          {showCenterText && (
            <g className="donut-center-text">
              {centerText && (
                <text
                  x={centerX}
                  y={centerY - 5}
                  className="donut-center-main"
                  textAnchor="middle"
                >
                  {centerText}
                </text>
              )}
              {centerSubtext && (
                <text
                  x={centerX}
                  y={centerY + 15}
                  className="donut-center-sub"
                  textAnchor="middle"
                >
                  {centerSubtext}
                </text>
              )}
              {!centerText && !centerSubtext && (
                <>
                  <text
                    x={centerX}
                    y={centerY - 5}
                    className="donut-center-main"
                    textAnchor="middle"
                  >
                    {total.toLocaleString()}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 15}
                    className="donut-center-sub"
                    textAnchor="middle"
                  >
                    Total
                  </text>
                </>
              )}
            </g>
          )}
        </svg>

        {/* Legend */}
        {generateLegend()}
      </div>
      
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="donut-chart-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
        >
          <strong>{tooltip.data.label}</strong><br />
          Value: {tooltip.data.value.toLocaleString()}<br />
          Percentage: {((tooltip.data.value / total) * 100).toFixed(1)}%
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
      className={`donut-chart-container ${className}`}
      {...baseProps}
    >
      {renderChart()}
    </BaseChart>
  );
};

export default DonutChart;