/**
 * Custom hook for getting responsive container dimensions
 * 
 * Provides container width based on available space for proper chart scaling
 */

import { useState, useEffect, useRef, RefObject } from 'react';

interface ContainerDimensions {
  width: number;
  height: number;
}

export const useContainerDimensions = (
  containerRef: RefObject<HTMLElement>
): ContainerDimensions => {
  const [dimensions, setDimensions] = useState<ContainerDimensions>({
    width: 800, // Default fallback width
    height: 300
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(400, rect.width || 800),
          height: rect.height || 300
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Create ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback for older browsers - window resize listener
    const handleResize = () => {
      setTimeout(updateDimensions, 100); // Debounce
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  return dimensions;
};

export default useContainerDimensions;