/**
 * Skip Link Component
 * 
 * Provides keyboard users with a way to skip to main content,
 * improving navigation efficiency and WCAG compliance.
 */

import React from 'react';
import './SkipLink.css';

interface SkipLinkProps {
  /** Target element ID to skip to */
  targetId?: string;
  /** Custom link text */
  text?: string;
  /** Additional CSS classes */
  className?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  text = 'Skip to main content',
  className = ''
}) => {
  const handleSkip = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    const target = document.getElementById(targetId);
    if (target) {
      // Make the target focusable if it's not already
      if (!target.getAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      
      target.focus();
      
      // Scroll to the target
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className={`skip-link ${className}`}
      onClick={handleSkip}
    >
      {text}
    </a>
  );
};

export default SkipLink;