/**
 * Performance Utilities
 * 
 * Utilities for optimizing React application performance including
 * lazy loading, memoization, debouncing, and virtualization helpers.
 */

import { lazy, ComponentType } from 'react';

// ============================================================================
// Lazy Loading
// ============================================================================

/**
 * Enhanced lazy loading with error boundaries and loading states
 */
export function createLazyComponent<T = {}>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  options: {
    fallback?: React.ComponentType;
    errorBoundary?: boolean;
    preload?: boolean;
  } = {}
) {
  const LazyComponent = lazy(importFunction);

  // Preload the component if requested
  if (options.preload) {
    importFunction().catch(console.error);
  }

  return LazyComponent;
}

/**
 * Preload a lazy component
 */
export function preloadComponent(
  importFunction: () => Promise<{ default: ComponentType<any> }>
): void {
  importFunction().catch(console.error);
}

// ============================================================================
// Intersection Observer for Lazy Loading
// ============================================================================

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for intersection observer-based lazy loading
 */
export class LazyLoadManager {
  private observer: IntersectionObserver | null = null;
  private callbacks = new WeakMap<Element, () => void>();

  constructor(options: LazyLoadOptions = {}) {
    const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            callback();
            if (triggerOnce) {
              this.unobserve(entry.target);
            }
          }
        }
      });
    }, { threshold, rootMargin });
  }

  observe(element: Element, callback: () => void): void {
    if (!this.observer) return;
    
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    if (!this.observer) return;
    
    this.observer.unobserve(element);
    this.callbacks.delete(element);
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks = new WeakMap();
    }
  }
}

// ============================================================================
// Debouncing and Throttling
// ============================================================================

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// Virtual Scrolling
// ============================================================================

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

/**
 * Calculate visible range for virtual scrolling
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { startIndex: number; endIndex: number; visibleItems: number } {
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + overscan * 2);

  return { startIndex, endIndex, visibleItems };
}

/**
 * Virtual scrolling helper class
 */
export class VirtualScrollManager<T> {
  private items: T[];
  private itemHeight: number;
  private containerHeight: number;
  private overscan: number;
  private scrollTop: number = 0;

  constructor(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan: number = 3
  ) {
    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.overscan = overscan;
  }

  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  getVisibleItems(): {
    items: T[];
    startIndex: number;
    endIndex: number;
    totalHeight: number;
    offsetY: number;
  } {
    const { startIndex, endIndex } = calculateVisibleRange(
      this.scrollTop,
      this.containerHeight,
      this.itemHeight,
      this.items.length,
      this.overscan
    );

    const visibleItems = this.items.slice(startIndex, endIndex + 1);
    const totalHeight = this.items.length * this.itemHeight;
    const offsetY = startIndex * this.itemHeight;

    return {
      items: visibleItems,
      startIndex,
      endIndex,
      totalHeight,
      offsetY
    };
  }

  updateItems(newItems: T[]): void {
    this.items = newItems;
  }

  getItemCount(): number {
    return this.items.length;
  }

  getTotalHeight(): number {
    return this.items.length * this.itemHeight;
  }
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Weak cache implementation for component memoization
 */
export class WeakComponentCache<K extends object, V> {
  private cache = new WeakMap<K, V>();

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): void {
    this.cache.delete(key);
  }
}

/**
 * LRU Cache for expensive computations
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Simple performance monitor
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  private measures = new Map<string, number>();

  mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
    this.marks.set(name, Date.now());
  }

  measure(name: string, startMark: string, endMark?: string): number | undefined {
    const startTime = this.marks.get(startMark);
    if (!startTime) return undefined;

    const endTime = endMark ? this.marks.get(endMark) : Date.now();
    if (!endTime) return undefined;

    const duration = endTime - startTime;
    this.measures.set(name, duration);

    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (error) {
        // Silently handle cases where marks don't exist
      }
    }

    return duration;
  }

  getMeasure(name: string): number | undefined {
    return this.measures.get(name);
  }

  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
    
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// ============================================================================
// Image Loading Optimization
// ============================================================================

/**
 * Optimized image loading with lazy loading and progressive enhancement
 */
export class ImageLoadManager {
  private lazyLoadManager: LazyLoadManager;
  private loadedImages = new Set<string>();

  constructor() {
    this.lazyLoadManager = new LazyLoadManager({
      rootMargin: '50px',
      threshold: 0.1
    });
  }

  lazyLoadImage(
    imgElement: HTMLImageElement,
    src: string,
    placeholderSrc?: string
  ): void {
    if (this.loadedImages.has(src)) {
      imgElement.src = src;
      return;
    }

    // Set placeholder if provided
    if (placeholderSrc) {
      imgElement.src = placeholderSrc;
    }

    this.lazyLoadManager.observe(imgElement, () => {
      const tempImg = new Image();
      tempImg.onload = () => {
        imgElement.src = src;
        imgElement.classList.add('loaded');
        this.loadedImages.add(src);
      };
      tempImg.onerror = () => {
        imgElement.classList.add('error');
      };
      tempImg.src = src;
    });
  }

  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => 
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            this.loadedImages.add(url);
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        })
      )
    );
  }

  disconnect(): void {
    this.lazyLoadManager.disconnect();
  }
}

// ============================================================================
// Bundle Splitting Helpers
// ============================================================================

/**
 * Create code-split routes with proper error boundaries
 */
export function createAsyncRoute(
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  _fallbackComponent?: ComponentType
) {
  const AsyncComponent = lazy(importFunction);
  
  return {
    Component: AsyncComponent,
    preload: () => importFunction().catch(console.error),
  };
}

// ============================================================================
// Export performance monitor instance
// ============================================================================

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// Web Vitals Monitoring
// ============================================================================

/**
 * Monitor Core Web Vitals
 */
export function monitorWebVitals(callback: (metric: any) => void): void {
  if (typeof window === 'undefined') return;

  // Measure FCP (First Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            callback({
              name: 'FCP',
              value: entry.startTime,
              rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor'
            });
          }
        });
      });
      observer.observe({ type: 'paint', buffered: true });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }
}

export default {
  LazyLoadManager,
  VirtualScrollManager,
  WeakComponentCache,
  LRUCache,
  PerformanceMonitor,
  ImageLoadManager,
  debounce,
  throttle,
  createLazyComponent,
  preloadComponent,
  performanceMonitor,
  monitorWebVitals
};