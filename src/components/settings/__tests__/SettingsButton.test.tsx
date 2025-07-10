import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsButton } from '../SettingsButton';
import '@testing-library/jest-dom';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('SettingsButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<SettingsButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button', { name: /open settings/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    render(<SettingsButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button', { name: /open settings/i });
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('displays notification indicator when hasNotification is true', () => {
    render(<SettingsButton onClick={mockOnClick} hasNotification={true} />);
    
    const button = screen.getByRole('button', { name: /open settings/i });
    expect(button).toHaveAttribute('data-has-notification', 'true');
  });

  it('does not display notification indicator when hasNotification is false', () => {
    render(<SettingsButton onClick={mockOnClick} hasNotification={false} />);
    
    const button = screen.getByRole('button', { name: /open settings/i });
    expect(button).toHaveAttribute('data-has-notification', 'false');
  });
});
