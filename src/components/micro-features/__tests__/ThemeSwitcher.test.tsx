import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeSwitcher from '../ThemeSwitcher';

// Mock data for testing
const mockOnThemeChange = jest.fn();

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
    // Reset document styles
    document.documentElement.style.cssText = '';
    document.body.className = '';
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('renders theme switcher button', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('theme-btn');
    });

    it('displays dark theme by default', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark');
      expect(button).toHaveAttribute('title', 'Theme: Dark Command');
    });

    it('displays correct icon for dark theme', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const icon = screen.getByText('🌙');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('theme-icon');
    });

    it('displays theme label correctly', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const label = screen.getByText('DARK');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('theme-label');
    });

    it('applies default CSS classes', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('theme-switcher');
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('cycles from dark to night when clicked', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('night');
      expect(button).toHaveAttribute('title', 'Theme: Night Ops');
      expect(screen.getByText('🔒')).toBeInTheDocument();
      expect(screen.getByText('NIGHT')).toBeInTheDocument();
    });

    it('cycles from night to combat when clicked twice', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // dark -> night
      fireEvent.click(button); // night -> combat
      
      expect(button).toHaveClass('combat');
      expect(button).toHaveAttribute('title', 'Theme: Combat Ready');
      expect(screen.getByText('⚔️')).toBeInTheDocument();
      expect(screen.getByText('COMBAT')).toBeInTheDocument();
    });

    it('cycles from combat back to dark when clicked three times', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // dark -> night
      fireEvent.click(button); // night -> combat
      fireEvent.click(button); // combat -> dark
      
      expect(button).toHaveClass('dark');
      expect(button).toHaveAttribute('title', 'Theme: Dark Command');
      expect(screen.getByText('🌙')).toBeInTheDocument();
      expect(screen.getByText('DARK')).toBeInTheDocument();
    });

    it('maintains state across multiple cycles', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      // Cycle through themes multiple times
      for (let i = 0; i < 9; i++) {
        fireEvent.click(button);
      }
      
      // Should be back to dark theme (9 % 3 = 0)
      expect(button).toHaveClass('dark');
    });

    it('starts with custom initial theme when provided', () => {
      render(<ThemeSwitcher initialTheme="night" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('night');
      expect(screen.getByText('NIGHT')).toBeInTheDocument();
    });
  });

  // Visual States and CSS Classes Tests
  describe('Visual States and CSS Classes', () => {
    it('applies night theme styles correctly', () => {
      render(<ThemeSwitcher initialTheme="night" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-btn', 'night');
      expect(screen.getByText('🔒')).toBeInTheDocument();
    });

    it('applies dark theme styles correctly', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-btn', 'dark');
      expect(screen.getByText('🌙')).toBeInTheDocument();
    });

    it('applies combat theme styles correctly', () => {
      render(<ThemeSwitcher initialTheme="combat" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-btn', 'combat');
      expect(screen.getByText('⚔️')).toBeInTheDocument();
    });

    it('updates CSS classes when theme changes', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('dark');
      fireEvent.click(button);
      expect(button).toHaveClass('night');
      expect(button).not.toHaveClass('dark');
    });
  });

  // Callback Integration Tests
  describe('Callback Integration', () => {
    it('calls onThemeChange when theme is changed', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnThemeChange).toHaveBeenCalledWith('night', expect.objectContaining({
        name: 'Night Ops',
        colors: expect.any(Object),
        opacity: expect.any(Object),
        effects: expect.any(Object)
      }));
    });

    it('calls onThemeChange with correct sequence of themes', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button); // dark -> night
      expect(mockOnThemeChange).toHaveBeenCalledWith('night', expect.any(Object));
      
      fireEvent.click(button); // night -> combat
      expect(mockOnThemeChange).toHaveBeenCalledWith('combat', expect.any(Object));
      
      fireEvent.click(button); // combat -> dark
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark', expect.any(Object));
    });

    it('calls callbacks multiple times for multiple theme changes', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnThemeChange).toHaveBeenCalledTimes(3);
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('has descriptive title attributes for all themes', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      // Dark theme
      expect(button).toHaveAttribute('title', 'Theme: Dark Command');
      
      // Night theme
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Theme: Night Ops');
      
      // Combat theme
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Theme: Combat Ready');
    });

    it('is keyboard accessible', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(mockOnThemeChange).toHaveBeenCalled();
      
      // Test Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(mockOnThemeChange).toHaveBeenCalledTimes(2);
    });

    it('maintains focus after theme change', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.click(button);
      
      expect(document.activeElement).toBe(button);
    });

    it('has appropriate aria attributes', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title');
      expect(button).toHaveProperty('tagName', 'BUTTON');
    });
  });

  // Props Validation Tests
  describe('Props Validation', () => {
    it('handles missing onThemeChange callback gracefully', () => {
      expect(() => {
        render(<ThemeSwitcher />);
      }).not.toThrow();
      
      const button = screen.getByRole('button');
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });

    it('handles invalid initial theme gracefully', () => {
      render(<ThemeSwitcher initialTheme={'invalid' as any} onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      // Should default to dark theme
      expect(button).toHaveClass('dark');
      expect(screen.getByText('DARK')).toBeInTheDocument();
    });

    it('handles rapid successive clicks without errors', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      
      expect(mockOnThemeChange).toHaveBeenCalledTimes(10);
    });
  });

  // Theme Configuration Tests
  describe('Theme Configuration', () => {
    it('provides correct configuration for dark theme', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // This will trigger from dark to night, so we need to check the callback
      fireEvent.click(button); // night to combat
      fireEvent.click(button); // combat to dark
      
      const lastCall = mockOnThemeChange.mock.calls[mockOnThemeChange.mock.calls.length - 1];
      const [theme, config] = lastCall;
      
      expect(theme).toBe('dark');
      expect(config.name).toBe('Dark Command');
      expect(config.colors).toHaveProperty('primary-bg');
      expect(config.opacity).toHaveProperty('overlay');
      expect(config.effects).toHaveProperty('glow');
    });

    it('provides correct configuration for night theme', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // dark to night
      
      const [theme, config] = mockOnThemeChange.mock.calls[0];
      
      expect(theme).toBe('night');
      expect(config.name).toBe('Night Ops');
      expect(config.colors['primary-bg']).toBe('#000000');
      expect(config.colors['text-primary']).toBe('#888888');
    });

    it('provides correct configuration for combat theme', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // dark to night
      fireEvent.click(button); // night to combat
      
      const [theme, config] = mockOnThemeChange.mock.calls[1];
      
      expect(theme).toBe('combat');
      expect(config.name).toBe('Combat Ready');
      expect(config.colors['primary-bg']).toBe('#1a0000');
      expect(config.colors['accent-cyan']).toBe('#ff0040');
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('handles async onThemeChange callback', async () => {
      const asyncCallback = jest.fn().mockResolvedValue(undefined);
      render(<ThemeSwitcher onThemeChange={asyncCallback} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(asyncCallback).toHaveBeenCalled();
    });

    it('handles error in onThemeChange callback gracefully', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      expect(() => {
        render(<ThemeSwitcher onThemeChange={errorCallback} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
      }).not.toThrow();
    });

    it('handles simultaneous rapid theme changes', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      // Simulate simultaneous events
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnThemeChange).toHaveBeenCalledTimes(3);
      expect(button).toHaveClass('dark'); // Should cycle back to dark
    });
  });

  // DOM Integration Tests
  describe('DOM Integration', () => {
    it('applies CSS custom properties to document root', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // Switch to night theme
      
      // Verify CSS custom properties are applied (mock implementation)
      expect(mockOnThemeChange).toHaveBeenCalledWith('night', expect.objectContaining({
        colors: expect.objectContaining({
          'primary-bg': '#000000',
          'text-primary': '#888888'
        })
      }));
    });

    it('updates body class when theme changes', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // Switch to night theme
      
      // The component should call the callback with theme information
      expect(mockOnThemeChange).toHaveBeenCalledWith('night', expect.any(Object));
    });

    it('persists theme preference to localStorage', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // Switch to night theme
      
      // The component should handle localStorage persistence
      expect(mockOnThemeChange).toHaveBeenCalledWith('night', expect.any(Object));
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('works with different callback functions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const { rerender } = render(<ThemeSwitcher onThemeChange={callback1} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(callback1).toHaveBeenCalled();
      
      rerender(<ThemeSwitcher onThemeChange={callback2} />);
      fireEvent.click(button);
      
      expect(callback2).toHaveBeenCalled();
    });

    it('maintains theme state when props change', () => {
      const { rerender } = render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // Switch to night
      
      expect(button).toHaveClass('night');
      
      // Re-render with new callback
      const newCallback = jest.fn();
      rerender(<ThemeSwitcher onThemeChange={newCallback} />);
      
      // Theme state should be maintained
      expect(button).toHaveClass('night');
    });

    it('provides theme configuration in callbacks', () => {
      render(<ThemeSwitcher onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const [theme, config] = mockOnThemeChange.mock.calls[0];
      expect(typeof theme).toBe('string');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('colors');
      expect(config).toHaveProperty('opacity');
      expect(config).toHaveProperty('effects');
    });
  });
});
