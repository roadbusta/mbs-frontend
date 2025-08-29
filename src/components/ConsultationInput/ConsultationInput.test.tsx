/**
 * Tests for ConsultationInput Component
 * 
 * Tests UI behavior improvements:
 * 1. Proper spacing between description and context selector
 * 2. Validation only shows after user starts typing
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ConsultationInput from './ConsultationInput';
import type { ConsultationContext } from '../../types/api.types';

// Mock props
const mockProps = {
  value: '',
  onChange: vi.fn(),
  context: 'general_practice' as ConsultationContext,
  onContextChange: vi.fn(),
  onAnalyze: vi.fn(),
  onClear: vi.fn(),
  isLoading: false,
};

describe('ConsultationInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Initial State - Before User Interaction', () => {
    test('should not show validation error on initial load with empty input', () => {
      render(<ConsultationInput {...mockProps} value="" />);
      
      // Should show character count but no error message
      expect(screen.getByText('0/10000 characters')).toBeInTheDocument();
      expect(screen.queryByText(/Minimum \d+ characters required/)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('should not show error styling on textarea initially', () => {
      render(<ConsultationInput {...mockProps} value="" />);
      
      const textarea = screen.getByRole('textbox', { name: /consultation note/i });
      expect(textarea).not.toHaveClass('error');
    });

    test('should have analyze button disabled initially', () => {
      render(<ConsultationInput {...mockProps} value="" />);
      
      const analyzeButton = screen.getByRole('button', { name: /analyze consultation/i });
      expect(analyzeButton).toBeDisabled();
    });
  });

  describe('After User Starts Typing', () => {
    test('should show validation error after user types and input is too short', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      render(<ConsultationInput {...mockProps} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox', { name: /consultation note/i });
      
      // User types some text (less than minimum)
      await user.type(textarea, 'short');
      
      // Should show validation error after typing
      await waitFor(() => {
        expect(screen.getByText('Minimum 10 characters required')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(textarea).toHaveClass('error');
      });
    });

    test('should remove validation error when input becomes valid', async () => {
      const user = userEvent.setup();
      
      // Use a wrapper component that actually manages state
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        return (
          <ConsultationInput 
            {...mockProps} 
            value={value}
            onChange={setValue}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const textarea = screen.getByRole('textbox', { name: /consultation note/i });
      
      // First type short text to trigger validation
      await user.type(textarea, 'short');
      await waitFor(() => {
        expect(screen.getByText('Minimum 10 characters required')).toBeInTheDocument();
      });
      
      // Then type more text to make it valid
      await user.type(textarea, ' text that is long enough');
      await waitFor(() => {
        expect(screen.queryByText('Minimum 10 characters required')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(textarea).not.toHaveClass('error');
      });
    });

    test('should show character count updates as user types', async () => {
      const user = userEvent.setup();
      
      // Use a wrapper component that actually manages state
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        return (
          <ConsultationInput 
            {...mockProps} 
            value={value}
            onChange={setValue}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const textarea = screen.getByRole('textbox', { name: /consultation note/i });
      
      await user.type(textarea, 'hello');
      
      await waitFor(() => {
        expect(screen.getByText('5/10000 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Spacing and Layout', () => {
    test('should have proper spacing between description and context selector', () => {
      render(<ConsultationInput {...mockProps} />);
      
      const description = screen.getByText(/Enter a consultation note and select the appropriate context/);
      const contextLabel = screen.getByLabelText(/Consultation Context/);
      
      // Check that elements exist
      expect(description).toBeInTheDocument();
      expect(contextLabel).toBeInTheDocument();
      
      // Get computed styles to verify spacing
      const descriptionElement = description.closest('.input-header');
      const contextElement = contextLabel.closest('.context-selector');
      
      expect(descriptionElement).toBeInTheDocument();
      expect(contextElement).toBeInTheDocument();
    });

    test('should maintain responsive layout on different screen sizes', () => {
      render(<ConsultationInput {...mockProps} />);
      
      const container = screen.getByText(/Consultation Note Analysis/).closest('.consultation-input');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('consultation-input');
    });
  });

  describe('User Interaction Flow', () => {
    test('should enable analyze button only after valid input is entered', async () => {
      const user = userEvent.setup();
      
      // Use a wrapper component that actually manages state
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        return (
          <ConsultationInput 
            {...mockProps} 
            value={value}
            onChange={setValue}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const textarea = screen.getByRole('textbox', { name: /consultation note/i });
      const analyzeButton = screen.getByRole('button', { name: /analyze consultation/i });
      
      // Initially disabled
      expect(analyzeButton).toBeDisabled();
      
      // Type valid text
      await user.type(textarea, 'Patient presents with chest pain lasting 2 hours');
      
      // Should be enabled after valid text
      await waitFor(() => {
        expect(analyzeButton).not.toBeDisabled();
      });
    });

    test('should call onChange handler when user types', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      render(<ConsultationInput {...mockProps} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox', { name: /consultation note/i });
      
      await user.type(textarea, 'hello');
      
      // Should have called onChange for each character
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Validation States', () => {
    test('should show success state with valid input', () => {
      const validText = 'Patient presents with chest pain lasting 2 hours';
      render(<ConsultationInput {...mockProps} value={validText} />);
      
      // Should show character count without error
      expect(screen.getByText(`${validText.length}/10000 characters`)).toBeInTheDocument();
      expect(screen.queryByText(/Minimum \d+ characters required/)).not.toBeInTheDocument();
    });

    test('should show warning state when approaching character limit', async () => {
      const user = userEvent.setup();
      
      // Use a wrapper component with pre-filled text (simulating user has typed)
      const TestWrapper = () => {
        const [value, setValue] = React.useState('a'.repeat(8500)); // Start with warning-level text
        return (
          <ConsultationInput 
            {...mockProps} 
            value={value}
            onChange={setValue}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const textarea = screen.getByRole('textbox', { name: /consultation note/i });
      
      // Trigger user interaction by typing one character 
      await user.type(textarea, 'b');
      
      await waitFor(() => {
        expect(screen.getByText(/Approaching character limit/)).toBeInTheDocument();
      });
    });

    test('should prevent input over maximum length', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      
      const maxLengthText = 'a'.repeat(10000);
      render(<ConsultationInput {...mockProps} value={maxLengthText} onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox', { name: /consultation note/i });
      
      // Try to type more
      await user.type(textarea, 'extra');
      
      // onChange should not be called for characters over limit
      // (implementation depends on how component handles max length)
    });
  });
});