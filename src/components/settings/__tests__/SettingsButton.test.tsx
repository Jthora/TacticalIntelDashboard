import '@testing-library/jest-dom';

import { beforeEach,describe, expect, it, jest } from '@jest/globals';
import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';

import { SettingsButton } from '../SettingsButton';

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
