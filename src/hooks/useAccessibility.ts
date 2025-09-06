/**
 * useAccessibility Hook
 * 
 * React hook for accessibility features and WCAG compliance.
 * Provides focus management, screen reader support, and keyboard navigation.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  FocusTrap,
  RovingTabIndex,
  announceToScreenReader,
  generateA11yId,
  prefersReducedMotion,
  liveRegionManager,
  auditAccessibility
} from '../utils/accessibility';

// ============================================================================
// Types
// ============================================================================

interface UseAccessibilityOptions {
  focusTrap?: boolean;
  rovingTabIndex?: {
    enabled: boolean;
    itemSelector: string;
  };
  announceChanges?: boolean;
  respectMotionPreference?: boolean;
}

interface AccessibilityState {
  prefersReducedMotion: boolean;
  highContrast: boolean;
  focusVisible: boolean;
  screenReaderActive: boolean;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);
  const rovingTabIndexRef = useRef<RovingTabIndex | null>(null);
  
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    prefersReducedMotion: prefersReducedMotion(),
    highContrast: false,
    focusVisible: false,
    screenReaderActive: false
  });

  // Initialize accessibility features
  useEffect(() => {
    if (!containerRef.current) return;

    // Set up focus trap if requested
    if (options.focusTrap) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
      focusTrapRef.current.activate();
    }

    // Set up roving tab index if requested
    if (options.rovingTabIndex?.enabled && options.rovingTabIndex.itemSelector) {
      rovingTabIndexRef.current = new RovingTabIndex(
        containerRef.current,
        options.rovingTabIndex.itemSelector
      );
    }

    // Cleanup
    return () => {
      focusTrapRef.current?.deactivate();
      rovingTabIndexRef.current?.destroy();
    };
  }, [options.focusTrap, options.rovingTabIndex]);

  // Monitor accessibility preferences
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const updateState = () => {
      setAccessibilityState(prev => ({
        ...prev,
        prefersReducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
      }));
    };

    // Initial check
    updateState();

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateState);
    });

    // Cleanup
    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateState);
      });
    };
  }, []);

  // Detect screen reader usage
  useEffect(() => {
    let screenReaderTimer: NodeJS.Timeout;
    
    const checkScreenReader = () => {
      const testElement = document.createElement('div');
      testElement.setAttribute('aria-hidden', 'true');
      testElement.style.cssText = 'position:absolute;left:-10000px;';
      testElement.innerHTML = 'Screen reader test';
      
      document.body.appendChild(testElement);
      
      screenReaderTimer = setTimeout(() => {
        const isActive = document.activeElement === testElement;
        setAccessibilityState(prev => ({ ...prev, screenReaderActive: isActive }));
        document.body.removeChild(testElement);
      }, 100);
    };

    checkScreenReader();

    return () => {
      if (screenReaderTimer) {
        clearTimeout(screenReaderTimer);
      }
    };
  }, []);

  // Focus management utilities
  const focusManagement = {
    trap: useCallback(() => {
      if (containerRef.current && !focusTrapRef.current) {
        focusTrapRef.current = new FocusTrap(containerRef.current);
        focusTrapRef.current.activate();
      }
    }, []),

    release: useCallback(() => {
      focusTrapRef.current?.deactivate();
      focusTrapRef.current = null;
    }, []),

    focusFirst: useCallback(() => {
      const firstFocusable = containerRef.current?.querySelector(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }, []),

    focusById: useCallback((id: string) => {
      const element = document.getElementById(id);
      element?.focus();
    }, []),
  };

  // Screen reader utilities
  const screenReader = {
    announce: useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (options.announceChanges !== false) {
        announceToScreenReader(message, priority);
      }
    }, [options.announceChanges]),

    createLiveRegion: useCallback((id: string, level: 'polite' | 'assertive' = 'polite') => {
      return liveRegionManager.createRegion(id, level);
    }, []),

    updateLiveRegion: useCallback((regionId: string, message: string) => {
      liveRegionManager.announce(regionId, message);
    }, []),

    clearLiveRegion: useCallback((regionId: string) => {
      liveRegionManager.clear(regionId);
    }, []),
  };

  // Keyboard navigation utilities
  const keyboard = {
    handleArrowNavigation: useCallback((
      event: React.KeyboardEvent,
      items: HTMLElement[],
      currentIndex: number,
      onIndexChange: (newIndex: number) => void
    ) => {
      const { key } = event;
      let newIndex = currentIndex;

      switch (key) {
        case 'ArrowRight':
        case 'ArrowDown':
          newIndex = (currentIndex + 1) % items.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          newIndex = (currentIndex - 1 + items.length) % items.length;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      onIndexChange(newIndex);
      items[newIndex]?.focus();
    }, []),

    handleEscapeKey: useCallback((
      event: React.KeyboardEvent,
      onEscape: () => void
    ) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    }, []),
  };

  // Accessibility audit
  const audit = useCallback(() => {
    if (!containerRef.current) {
      return { issues: [], score: 100 };
    }
    return auditAccessibility(containerRef.current);
  }, []);

  // Generate unique IDs for accessibility
  const generateId = useCallback((prefix?: string) => {
    return generateA11yId(prefix);
  }, []);

  return {
    // Refs
    containerRef,
    
    // State
    accessibilityState,
    
    // Utilities
    focusManagement,
    screenReader,
    keyboard,
    audit,
    generateId,
    
    // Convenience getters
    get prefersReducedMotion() {
      return accessibilityState.prefersReducedMotion;
    },
    
    get highContrast() {
      return accessibilityState.highContrast;
    },
    
    get screenReaderActive() {
      return accessibilityState.screenReaderActive;
    }
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for modal/dialog accessibility
 */
export function useModalAccessibility(isOpen: boolean) {
  const { containerRef, focusManagement, screenReader, keyboard } = useAccessibility({
    focusTrap: isOpen,
    announceChanges: true,
  });

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    keyboard.handleEscapeKey(event, () => {
      // This should be handled by the parent component
      console.warn('Modal escape key pressed - parent should handle close');
    });
  }, [keyboard]);

  useEffect(() => {
    if (isOpen) {
      screenReader.announce('Dialog opened');
    } else {
      screenReader.announce('Dialog closed');
    }
  }, [isOpen, screenReader]);

  return {
    containerRef,
    handleKeyDown,
    focusManagement,
    screenReader,
  };
}

/**
 * Hook for table accessibility
 */
export function useTableAccessibility<T>(data: T[], columns: string[]) {
  const { containerRef, screenReader, generateId } = useAccessibility();
  const tableId = generateId('table');
  const captionId = generateId('table-caption');

  const announceTableInfo = useCallback(() => {
    const message = `Table with ${data.length} rows and ${columns.length} columns`;
    screenReader.announce(message);
  }, [data.length, columns.length, screenReader]);

  const announceRowSelection = useCallback((rowIndex: number, selected: boolean) => {
    const message = selected 
      ? `Row ${rowIndex + 1} selected` 
      : `Row ${rowIndex + 1} deselected`;
    screenReader.announce(message);
  }, [screenReader]);

  const handleCellNavigation = useCallback((
    event: React.KeyboardEvent,
    rowIndex: number,
    colIndex: number,
    onNavigate: (row: number, col: number) => void
  ) => {
    const { key } = event;
    let newRow = rowIndex;
    let newCol = colIndex;

    switch (key) {
      case 'ArrowRight':
        newCol = Math.min(colIndex + 1, columns.length - 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(colIndex - 1, 0);
        break;
      case 'ArrowDown':
        newRow = Math.min(rowIndex + 1, data.length - 1);
        break;
      case 'ArrowUp':
        newRow = Math.max(rowIndex - 1, 0);
        break;
      case 'Home':
        if (event.ctrlKey) {
          newRow = 0;
          newCol = 0;
        } else {
          newCol = 0;
        }
        break;
      case 'End':
        if (event.ctrlKey) {
          newRow = data.length - 1;
          newCol = columns.length - 1;
        } else {
          newCol = columns.length - 1;
        }
        break;
      default:
        return;
    }

    if (newRow !== rowIndex || newCol !== colIndex) {
      event.preventDefault();
      onNavigate(newRow, newCol);
    }
  }, [data.length, columns.length]);

  return {
    containerRef,
    tableId,
    captionId,
    announceTableInfo,
    announceRowSelection,
    handleCellNavigation,
    screenReader,
  };
}

/**
 * Hook for form accessibility
 */
export function useFormAccessibility() {
  const { containerRef, screenReader, generateId } = useAccessibility();

  const createFieldProps = useCallback((fieldName: string, required: boolean = false) => {
    const fieldId = generateId(`field-${fieldName}`);
    const errorId = generateId(`error-${fieldName}`);
    const helpId = generateId(`help-${fieldName}`);

    return {
      fieldId,
      errorId,
      helpId,
      fieldProps: {
        id: fieldId,
        required,
        'aria-required': required,
        'aria-describedby': `${helpId} ${errorId}`.trim(),
      },
    };
  }, [generateId]);

  const announceError = useCallback((fieldName: string, error: string) => {
    screenReader.announce(`${fieldName}: ${error}`, 'assertive');
  }, [screenReader]);

  const announceSuccess = useCallback((message: string = 'Form submitted successfully') => {
    screenReader.announce(message, 'polite');
  }, [screenReader]);

  return {
    containerRef,
    createFieldProps,
    announceError,
    announceSuccess,
    screenReader,
  };
}

export default useAccessibility;