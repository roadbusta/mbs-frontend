/**
 * Performance Optimization Hooks
 * 
 * React hooks for optimizing component performance including
 * lazy loading, virtualization, memoization, and debouncing.
 */

import { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  RefCallback 
} from 'react';
import {
  LazyLoadManager,
  VirtualScrollManager,
  LRUCache,
  debounce,
  throttle,
  performanceMonitor
} from '../utils/performance';

// ============================================================================
// Lazy Loading Hook
// ============================================================================

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const lazyLoadManagerRef = useRef<LazyLoadManager | null>(null);
  const elementRef = useRef<Element | null>(null);

  const { triggerOnce = true } = options;

  useEffect(() => {
    lazyLoadManagerRef.current = new LazyLoadManager(options);
    
    return () => {
      lazyLoadManagerRef.current?.disconnect();
    };
  }, []);

  const ref = useCallback<RefCallback<Element>>((element) => {
    if (elementRef.current && lazyLoadManagerRef.current) {
      lazyLoadManagerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = element;

    if (element && lazyLoadManagerRef.current && (!triggerOnce || !hasTriggered)) {
      lazyLoadManagerRef.current.observe(element, () => {
        setIsIntersecting(true);
        setHasTriggered(true);
      });
    }
  }, [hasTriggered, triggerOnce]);

  const reset = useCallback(() => {
    setIsIntersecting(false);
    setHasTriggered(false);
  }, []);

  return { ref, isIntersecting, hasTriggered, reset };
}

// ============================================================================
// Virtual Scrolling Hook
// ============================================================================

interface UseVirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
  estimatedItemHeight?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  options: UseVirtualScrollOptions
) {
  const { itemHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const virtualScrollManagerRef = useRef<VirtualScrollManager<T> | null>(null);

  // Initialize virtual scroll manager
  useEffect(() => {
    virtualScrollManagerRef.current = new VirtualScrollManager(
      items,
      itemHeight,
      containerHeight,
      overscan
    );
  }, [items, itemHeight, containerHeight, overscan]);

  // Update scroll position
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    virtualScrollManagerRef.current?.updateScrollTop(newScrollTop);
  }, []);

  // Get visible items
  const virtualData = useMemo(() => {
    if (!virtualScrollManagerRef.current) {
      return {
        items: [],
        startIndex: 0,
        endIndex: 0,
        totalHeight: 0,
        offsetY: 0
      };
    }

    virtualScrollManagerRef.current.updateScrollTop(scrollTop);
    return virtualScrollManagerRef.current.getVisibleItems();
  }, [scrollTop, items, itemHeight, containerHeight]);

  return {
    virtualData,
    handleScroll,
    scrollTop,
    totalHeight: items.length * itemHeight
  };
}

// ============================================================================
// Debounced Value Hook
// ============================================================================

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Debounced Callback Hook
// ============================================================================

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  return useCallback(
    debounce(callback, delay),
    [delay, ...deps]
  ) as T;
}

// ============================================================================
// Throttled Callback Hook
// ============================================================================

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): T {
  return useCallback(
    throttle(callback, limit),
    [limit, ...deps]
  ) as T;
}

// ============================================================================
// Memoized Cache Hook
// ============================================================================

export function useMemoizedCache<K, V>(capacity: number = 50) {
  const cacheRef = useRef<LRUCache<K, V> | null>(null);

  if (!cacheRef.current) {
    cacheRef.current = new LRUCache<K, V>(capacity);
  }

  const get = useCallback((key: K): V | undefined => {
    return cacheRef.current?.get(key);
  }, []);

  const set = useCallback((key: K, value: V): void => {
    cacheRef.current?.set(key, value);
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current?.clear();
  }, []);

  const size = useCallback((): number => {
    return cacheRef.current?.size() || 0;
  }, []);

  return { get, set, clear, size };
}

// ============================================================================
// Performance Monitoring Hook
// ============================================================================

export function usePerformanceMonitor(componentName: string) {
  const mountTimeRef = useRef<string>(`${componentName}-mount-${Date.now()}`);
  
  useEffect(() => {
    const markName = mountTimeRef.current;
    performanceMonitor.mark(markName);

    return () => {
      const unmountMark = `${componentName}-unmount-${Date.now()}`;
      performanceMonitor.mark(unmountMark);
      const duration = performanceMonitor.measure(
        `${componentName}-lifecycle`,
        markName,
        unmountMark
      );
      
      if (duration && duration > 100) {
        console.warn(`${componentName} lifecycle took ${duration}ms`);
      }
    };
  }, [componentName]);

  const measureRender = useCallback((renderName: string = 'render') => {
    const startMark = `${componentName}-${renderName}-start-${Date.now()}`;
    const endMark = `${componentName}-${renderName}-end-${Date.now()}`;
    
    performanceMonitor.mark(startMark);
    
    return () => {
      performanceMonitor.mark(endMark);
      return performanceMonitor.measure(
        `${componentName}-${renderName}`,
        startMark,
        endMark
      );
    };
  }, [componentName]);

  return { measureRender };
}

// ============================================================================
// Intersection Observer Hook
// ============================================================================

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<Element | null>(null);

  const ref = useCallback<RefCallback<Element>>((element) => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = element;

    if (!element) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observerRef.current.observe(element);
  }, [options]);

  useEffect(() => {
    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
    };
  }, []);

  return { ref, entry, isIntersecting };
}

// ============================================================================
// Optimized List Hook
// ============================================================================

interface UseOptimizedListOptions<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  searchQuery?: string;
  searchFields?: (keyof T)[];
  filterFn?: (item: T) => boolean;
  sortFn?: (a: T, b: T) => number;
  enableVirtualization?: boolean;
  overscan?: number;
}

export function useOptimizedList<T extends Record<string, any>>(
  options: UseOptimizedListOptions<T>
) {
  const {
    items,
    itemHeight,
    containerHeight,
    searchQuery = '',
    searchFields = [],
    filterFn,
    sortFn,
    enableVirtualization = true,
    overscan = 3
  } = options;

  // Memoized filtered and searched items
  const processedItems = useMemo(() => {
    let result = [...items];

    // Apply custom filter
    if (filterFn) {
      result = result.filter(filterFn);
    }

    // Apply search
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply sort
    if (sortFn) {
      result.sort(sortFn);
    }

    return result;
  }, [items, searchQuery, searchFields, filterFn, sortFn]);

  // Virtual scrolling
  const virtualScroll = useVirtualScroll(
    processedItems,
    containerHeight,
    { itemHeight, overscan }
  );

  const visibleItems = enableVirtualization 
    ? virtualScroll.virtualData.items
    : processedItems;

  const totalHeight = enableVirtualization
    ? virtualScroll.totalHeight
    : processedItems.length * itemHeight;

  const offsetY = enableVirtualization
    ? virtualScroll.virtualData.offsetY
    : 0;

  return {
    items: visibleItems,
    totalItems: processedItems.length,
    totalHeight,
    offsetY,
    startIndex: enableVirtualization ? virtualScroll.virtualData.startIndex : 0,
    endIndex: enableVirtualization ? virtualScroll.virtualData.endIndex : processedItems.length - 1,
    handleScroll: enableVirtualization ? virtualScroll.handleScroll : undefined,
  };
}

// ============================================================================
// Image Lazy Loading Hook
// ============================================================================

interface UseImageLazyLoadOptions {
  src: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
}

export function useImageLazyLoad(options: UseImageLazyLoadOptions) {
  const { src, placeholderSrc, threshold = 0.1, rootMargin = '50px' } = options;
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (!isIntersecting || isLoaded) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      setIsError(false);
    };
    img.onerror = () => {
      setIsError(true);
    };
    img.src = src;
  }, [isIntersecting, src, isLoaded]);

  return {
    ref,
    src: currentSrc,
    isLoaded,
    isError,
    isIntersecting
  };
}

// ============================================================================
// Bundle Preloader Hook
// ============================================================================

export function useBundlePreloader(
  preloadFunctions: Array<() => Promise<any>>,
  trigger: boolean = true
) {
  const [preloadStatus, setPreloadStatus] = useState<{
    loaded: boolean;
    error: boolean;
    progress: number;
  }>({
    loaded: false,
    error: false,
    progress: 0
  });

  useEffect(() => {
    if (!trigger) return;

    const preloadAll = async () => {
      let completed = 0;
      
      try {
        await Promise.all(
          preloadFunctions.map(async (preloadFn) => {
            try {
              await preloadFn();
              completed++;
              setPreloadStatus(prev => ({
                ...prev,
                progress: (completed / preloadFunctions.length) * 100
              }));
            } catch (error) {
              console.warn('Failed to preload bundle:', error);
            }
          })
        );
        
        setPreloadStatus({
          loaded: true,
          error: false,
          progress: 100
        });
      } catch (error) {
        setPreloadStatus(prev => ({
          ...prev,
          error: true
        }));
      }
    };

    preloadAll();
  }, [preloadFunctions, trigger]);

  return preloadStatus;
}

export default {
  useLazyLoad,
  useVirtualScroll,
  useDebouncedValue,
  useDebouncedCallback,
  useThrottledCallback,
  useMemoizedCache,
  usePerformanceMonitor,
  useIntersectionObserver,
  useOptimizedList,
  useImageLazyLoad,
  useBundlePreloader
};