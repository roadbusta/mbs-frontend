/**
 * Accessibility Utilities
 * 
 * Comprehensive accessibility utilities and helpers for WCAG compliance.
 * Includes focus management, screen reader support, and accessibility testing.
 */

// ============================================================================
// Focus Management
// ============================================================================

/**
 * Focus trap for modal dialogs and overlays
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: HTMLElement[];
  private firstFocusableElement: HTMLElement | null;
  private lastFocusableElement: HTMLElement | null;
  private previouslyFocusedElement: HTMLElement | null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  activate(): void {
    this.updateFocusableElements();
    
    // Focus the first focusable element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }

    // Add event listeners
    this.container.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('focusin', this.handleFocusIn);
  }

  deactivate(): void {
    // Remove event listeners
    this.container.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('focusin', this.handleFocusIn);

    // Return focus to previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Tab') {
      this.updateFocusableElements();
      
      if (this.focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === this.firstFocusableElement) {
          event.preventDefault();
          this.lastFocusableElement?.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === this.lastFocusableElement) {
          event.preventDefault();
          this.firstFocusableElement?.focus();
        }
      }
    }
  };

  private handleFocusIn = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    
    // If focus moves outside the container, bring it back
    if (!this.container.contains(target)) {
      event.preventDefault();
      this.firstFocusableElement?.focus();
    }
  };
}

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique IDs for accessibility attributes
 */
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Color and Contrast Utilities
// ============================================================================

/**
 * Calculate color contrast ratio (WCAG 2.1)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Check if color contrast meets WCAG standards
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  } else {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * Handle roving tabindex for component groups
 */
export class RovingTabIndex {
  private container: HTMLElement;
  private items: HTMLElement[];
  private currentIndex: number;

  constructor(container: HTMLElement, itemSelector: string) {
    this.container = container;
    this.items = Array.from(container.querySelectorAll(itemSelector));
    this.currentIndex = 0;
    
    this.initialize();
  }

  private initialize(): void {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.addEventListener('keydown', this.handleKeydown);
      item.addEventListener('focus', () => this.setCurrentIndex(index));
    });
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    const { key } = event;
    let newIndex = this.currentIndex;
    
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (this.currentIndex + 1) % this.items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = this.items.length - 1;
        break;
      default:
        return;
    }
    
    event.preventDefault();
    this.setCurrentIndex(newIndex);
    this.items[newIndex].focus();
  };

  private setCurrentIndex(index: number): void {
    this.items[this.currentIndex]?.setAttribute('tabindex', '-1');
    this.currentIndex = index;
    this.items[this.currentIndex]?.setAttribute('tabindex', '0');
  }

  destroy(): void {
    this.items.forEach(item => {
      item.removeEventListener('keydown', this.handleKeydown);
    });
  }
}

// ============================================================================
// Screen Reader Utilities
// ============================================================================

/**
 * Format numbers for screen readers
 */
export function formatNumberForScreenReader(
  value: number,
  options: {
    currency?: string;
    percentage?: boolean;
    precision?: number;
    includeCommas?: boolean;
  } = {}
): string {
  const {
    currency,
    percentage = false,
    precision = 2,
    includeCommas = true
  } = options;

  let formatted = value.toFixed(precision);
  
  if (includeCommas) {
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  if (percentage) {
    return `${formatted} percent`;
  }
  
  if (currency) {
    return `${formatted} ${currency}`;
  }
  
  return formatted;
}

/**
 * Format dates for screen readers
 */
export function formatDateForScreenReader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for screen readers
 */
export function formatTimeForScreenReader(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}

// ============================================================================
// Motion and Animation
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Safe animation helper that respects reduced motion preference
 */
export function safeAnimate(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation | null {
  if (prefersReducedMotion()) {
    // Skip animation, just apply final state
    const finalKeyframe = keyframes[keyframes.length - 1];
    Object.assign(element.style, finalKeyframe);
    return null;
  }
  
  return element.animate(keyframes, options);
}

// ============================================================================
// ARIA Live Regions
// ============================================================================

/**
 * Create and manage ARIA live regions
 */
export class LiveRegionManager {
  private regions: Map<string, HTMLElement> = new Map();

  createRegion(
    id: string,
    level: 'polite' | 'assertive' = 'polite'
  ): HTMLElement {
    if (this.regions.has(id)) {
      return this.regions.get(id)!;
    }

    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', level);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('class', 'sr-only');
    region.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(region);
    this.regions.set(id, region);
    
    return region;
  }

  announce(regionId: string, message: string): void {
    const region = this.regions.get(regionId);
    if (region) {
      region.textContent = message;
    }
  }

  clear(regionId: string): void {
    const region = this.regions.get(regionId);
    if (region) {
      region.textContent = '';
    }
  }

  destroy(regionId?: string): void {
    if (regionId) {
      const region = this.regions.get(regionId);
      if (region && region.parentNode) {
        region.parentNode.removeChild(region);
        this.regions.delete(regionId);
      }
    } else {
      // Destroy all regions
      this.regions.forEach((region, _id) => {
        if (region.parentNode) {
          region.parentNode.removeChild(region);
        }
      });
      this.regions.clear();
    }
  }
}

// ============================================================================
// Validation and Testing
// ============================================================================

/**
 * Basic accessibility audit for a DOM element
 */
export function auditAccessibility(element: HTMLElement): {
  issues: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    element: HTMLElement;
  }>;
  score: number;
} {
  const issues: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    element: HTMLElement;
  }> = [];

  // Check for missing alt text on images
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.getAttribute('alt') && img.getAttribute('alt') !== '') {
      issues.push({
        type: 'missing-alt',
        severity: 'error',
        message: 'Image missing alt attribute',
        element: img as HTMLElement
      });
    }
  });

  // Check for form labels
  const inputs = element.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const id = input.id;
    const hasLabel = id && element.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        type: 'missing-label',
        severity: 'error',
        message: 'Form input missing accessible label',
        element: input as HTMLElement
      });
    }
  });

  // Check for heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let prevLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > prevLevel + 1) {
      issues.push({
        type: 'heading-hierarchy',
        severity: 'warning',
        message: `Heading level jumps from h${prevLevel} to h${level}`,
        element: heading as HTMLElement
      });
    }
    prevLevel = level;
  });

  // Check for interactive elements without accessible names
  const interactiveElements = element.querySelectorAll('button, a, [role="button"]');
  interactiveElements.forEach(elem => {
    const hasText = elem.textContent?.trim();
    const hasAriaLabel = elem.getAttribute('aria-label');
    const hasAriaLabelledBy = elem.getAttribute('aria-labelledby');
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        type: 'missing-accessible-name',
        severity: 'error',
        message: 'Interactive element missing accessible name',
        element: elem as HTMLElement
      });
    }
  });

  // Calculate basic accessibility score
  const totalChecks = images.length + inputs.length + headings.length + interactiveElements.length;
  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const score = totalChecks > 0 ? Math.max(0, ((totalChecks - errorCount) / totalChecks) * 100) : 100;

  return { issues, score: Math.round(score) };
}

// Create global live region manager instance
export const liveRegionManager = new LiveRegionManager();