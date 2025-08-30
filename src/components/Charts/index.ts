/**
 * Charts Module Exports
 * 
 * Centralized exports for all chart components and types.
 */

export { default as BaseChart } from './BaseChart';
export { default as LineChart } from './LineChart';
export { default as BarChart } from './BarChart';
export { default as DonutChart } from './DonutChart';

export type { ChartProps, ChartDataPoint } from './BaseChart';

// Re-export common types for convenience
export interface ChartColor {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ChartTheme {
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  fonts: {
    family: string;
    sizes: {
      small: number;
      medium: number;
      large: number;
    };
  };
}

// Common chart configurations
export const DEFAULT_CHART_COLORS = [
  '#4285f4', '#34a853', '#ff9800', '#ea4335', '#9c27b0',
  '#00bcd4', '#8bc34a', '#ffc107', '#e91e63', '#607d8b'
];

export const HEALTHCARE_THEME: ChartTheme = {
  colors: {
    primary: ['#4285f4', '#1a73e8', '#3367d6'],
    secondary: ['#34a853', '#137333', '#1e8e3e'],
    accent: ['#ff9800', '#f57c00', '#e65100']
  },
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      small: 11,
      medium: 14,
      large: 18
    }
  }
};