import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AlertForm from '../AlertForm';
// import { AlertConfig, AlertPriority } from '../../../types/AlertTypes';

// Mock CSS imports
jest.mock('../AlertForm.css', () => ({}));

describe('AlertForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  /*
  const mockAlert: AlertConfig = {
    id: 'test-alert-1',
    name: 'Test Alert',
    description: 'Test description',
    keywords: ['test', 'keyword'],
    sources: ['source1', 'source2'],
    priority: 'high' as AlertPriority,
    active: true,
    createdAt: new Date('2024-01-01'),
    triggerCount: 5,
    notifications: {
      browser: true,
      sound: false,
      email: 'test@example.com',
      webhook: 'https://example.com/webhook',
      customMessage: 'Custom alert message'
    },
    scheduling: {
      activeHours: {
        start: '09:00',
        end: '17:00'
      },
      activeDays: [1, 2, 3, 4, 5],
      timezone: 'UTC'
    }
  };
  */

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render basic form elements', () => {
      render(<AlertForm {...defaultProps} />);
      
      expect(screen.getByText(/create new alert/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/alert name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/keywords/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create alert/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should handle basic validation', async () => {
      const user = userEvent.setup();
      render(<AlertForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /create alert/i });
      await user.click(submitButton);
      
      // Should not submit with empty form
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit valid form data', async () => {
      const user = userEvent.setup();
      render(<AlertForm {...defaultProps} />);
      
      // Fill in required fields
      await user.type(screen.getByLabelText(/alert name/i), 'Test Alert');
      await user.type(screen.getByLabelText(/keywords/i), 'security, threats');
      
      const submitButton = screen.getByRole('button', { name: /create alert/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Alert',
            keywords: ['security', 'threats'],
            priority: 'medium',
            active: true
          })
        );
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertForm {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});