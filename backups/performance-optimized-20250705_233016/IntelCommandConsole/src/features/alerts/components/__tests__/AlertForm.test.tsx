import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlertForm from '../AlertForm';

// Mock CSS imports
jest.mock('../AlertForm.css', () => ({}));

describe('AlertForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

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