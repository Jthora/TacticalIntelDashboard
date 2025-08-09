import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuickFilterPresets } from '../QuickFilterPresets';

// Mock filter configuration types
interface FilterConfiguration {
  priority?: string[];
  type?: string[];
  timeRange?: string;
  region?: string[];
  source?: string[];
  status?: string[];
}

interface FilterPreset {
  id: string;
  name: string;
  label: string;
  filters: FilterConfiguration;
  description: string;
  color: string;
}

describe('QuickFilterPresets Component', () => {
  const mockOnPresetApply = jest.fn();
  const mockOnClearFilters = jest.fn();
  const mockOnCreatePreset = jest.fn();
  const mockOnDeletePreset = jest.fn();

  const defaultPresets: FilterPreset[] = [
    {
      id: 'breaking-news',
      name: 'Breaking',
      label: 'BRK',
      filters: { priority: ['high'], type: ['news'], timeRange: 'last-hour' },
      description: 'High-priority breaking news sources',
      color: '#ff4444'
    },
    {
      id: 'social-intel',
      name: 'Social',
      label: 'SOC',
      filters: { type: ['social'], region: ['domestic', 'international'] },
      description: 'Social media intelligence sources',
      color: '#44ccff'
    },
    {
      id: 'official-sources',
      name: 'Official',
      label: 'OFF',
      filters: { type: ['official'], priority: ['high', 'medium'] },
      description: 'Government and official sources',
      color: '#44ff44'
    }
  ];

  const defaultProps = {
    presets: defaultPresets,
    activePreset: null as string | null,
    onPresetApply: mockOnPresetApply,
    onClearFilters: mockOnClearFilters,
    onCreatePreset: mockOnCreatePreset,
    onDeletePreset: mockOnDeletePreset,
    isEnabled: true,
    allowCustomPresets: true,
    maxPresets: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    test('renders all preset buttons', () => {
      render(<QuickFilterPresets {...defaultProps} />);
      
      expect(screen.getByText('BRK')).toBeInTheDocument();
      expect(screen.getByText('SOC')).toBeInTheDocument();
      expect(screen.getByText('OFF')).toBeInTheDocument();
    });

    test('renders clear filters button', () => {
      render(<QuickFilterPresets {...defaultProps} />);
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveTextContent('CLR');
    });

    test('renders with correct ARIA labels', () => {
      render(<QuickFilterPresets {...defaultProps} />);
      
      const container = screen.getByRole('group', { name: /filter presets/i });
      expect(container).toBeInTheDocument();
      
      const breakingButton = screen.getByText('BRK');
      expect(breakingButton).toHaveAttribute('aria-label', 'Apply Breaking preset');
    });

    test('applies custom preset colors correctly', () => {
      render(<QuickFilterPresets {...defaultProps} />);
      
      const breakingButton = screen.getByText('BRK');
      expect(breakingButton).toHaveStyle({ borderColor: 'rgb(255, 68, 68)' });
    });
  });

  // Interaction Tests
  describe('Preset Interactions', () => {
    test('applies preset when clicked', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} />);
      
      const breakingButton = screen.getByText('BRK');
      await user.click(breakingButton);
      
      expect(mockOnPresetApply).toHaveBeenCalledWith('breaking-news');
      expect(mockOnPresetApply).toHaveBeenCalledTimes(1);
    });

    test('clears filters when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} />);
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);
      
      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });

    test('shows tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} />);
      
      const breakingButton = screen.getByText('BRK');
      await user.hover(breakingButton);
      
      await waitFor(() => {
        expect(screen.getByText('High-priority breaking news sources')).toBeInTheDocument();
      });
    });

    test('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} />);
      
      const breakingButton = screen.getByText('BRK');
      breakingButton.focus();
      
      await user.keyboard('{Tab}');
      expect(screen.getByText('SOC')).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnPresetApply).toHaveBeenCalledWith('social-intel');
    });
  });

  // Active State Tests
  describe('Active State Management', () => {
    test('highlights active preset', () => {
      render(<QuickFilterPresets {...defaultProps} activePreset="breaking-news" />);
      
      const breakingButton = screen.getByText('BRK');
      expect(breakingButton).toHaveClass('active');
      
      const socialButton = screen.getByText('SOC');
      expect(socialButton).not.toHaveClass('active');
    });

    test('changes active state when preset applied', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<QuickFilterPresets {...defaultProps} />);
      
      const socialButton = screen.getByText('SOC');
      await user.click(socialButton);
      
      // Simulate parent component updating activePreset
      rerender(<QuickFilterPresets {...defaultProps} activePreset="social-intel" />);
      
      expect(socialButton).toHaveClass('active');
    });

    test('removes active state when filters cleared', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<QuickFilterPresets {...defaultProps} activePreset="breaking-news" />);
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);
      
      // Simulate parent component clearing activePreset
      rerender(<QuickFilterPresets {...defaultProps} activePreset={null} />);
      
      const breakingButton = screen.getByText('BRK');
      expect(breakingButton).not.toHaveClass('active');
    });
  });

  // Disabled State Tests
  describe('Disabled State', () => {
    test('disables all buttons when component disabled', () => {
      render(<QuickFilterPresets {...defaultProps} isEnabled={false} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('shows disabled styling when disabled', () => {
      render(<QuickFilterPresets {...defaultProps} isEnabled={false} />);
      
      const container = screen.getByRole('group', { name: /filter presets/i });
      expect(container).toHaveClass('disabled');
    });

    test('prevents interaction when disabled', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} isEnabled={false} />);
      
      const breakingButton = screen.getByText('BRK');
      await user.click(breakingButton);
      
      expect(mockOnPresetApply).not.toHaveBeenCalled();
    });
  });

  // Custom Presets Tests
  describe('Custom Presets', () => {
    test('renders custom presets alongside default ones', () => {
      const customPresets: FilterPreset[] = [
        ...defaultPresets,
        {
          id: 'custom-threat',
          name: 'Threat',
          label: 'THR',
          filters: { priority: ['high'], type: ['threat'], timeRange: 'last-day' },
          description: 'Custom threat monitoring preset',
          color: '#ff8800'
        }
      ];

      render(<QuickFilterPresets {...defaultProps} presets={customPresets} />);
      
      expect(screen.getByText('THR')).toBeInTheDocument();
    });

    test('handles create custom preset action', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} />);
      
      // Simulate right-click context menu for creating preset
      const container = screen.getByRole('group', { name: /filter presets/i });
      fireEvent.contextMenu(container);
      
      const createButton = screen.getByRole('menuitem', { name: /create preset/i });
      await user.click(createButton);
      
      expect(mockOnCreatePreset).toHaveBeenCalledTimes(1);
    });

    test('handles delete custom preset action', async () => {
      const customPresets: FilterPreset[] = [
        ...defaultPresets,
        {
          id: 'custom-threat',
          name: 'Threat',
          label: 'THR',
          filters: { priority: ['high'], type: ['threat'] },
          description: 'Custom threat monitoring preset',
          color: '#ff8800'
        }
      ];

      render(<QuickFilterPresets {...defaultProps} presets={customPresets} />);
      
      const customButton = screen.getByText('THR');
      fireEvent.contextMenu(customButton);
      
      // Context menu should appear with option to delete
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      // For now, just verify the component handles right-click without errors
      // The actual deletion functionality would be tested via integration tests
    });

    test('enforces maximum preset limit', () => {
      const manyPresets: FilterPreset[] = Array.from({ length: 15 }, (_, i) => ({
        id: `preset-${i}`,
        name: `Preset${i}`,
        label: `P${i}`,
        filters: { type: ['test'] },
        description: `Test preset ${i}`,
        color: '#ffffff'
      }));

      render(<QuickFilterPresets {...defaultProps} presets={manyPresets} maxPresets={10} />);
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Apply') || btn.textContent === 'CLR'
      );
      
      // Should show max 10 preset buttons + 1 clear button
      expect(buttons).toHaveLength(11);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    test('handles rapid preset switching efficiently', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} />);
      
      const buttons = [
        screen.getByText('BRK'),
        screen.getByText('SOC'),
        screen.getByText('OFF')
      ];
      
      // Rapidly click presets
      for (let i = 0; i < 10; i++) {
        await user.click(buttons[i % 3]);
      }
      
      expect(mockOnPresetApply).toHaveBeenCalledTimes(10);
    });

    test('debounces preset application when clicked rapidly', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<QuickFilterPresets {...defaultProps} />);
      
      const breakingButton = screen.getByText('BRK');
      
      // First click should work
      await user.click(breakingButton);
      expect(mockOnPresetApply).toHaveBeenCalledTimes(1);
      
      // Simulate parent component updating activePreset
      rerender(<QuickFilterPresets {...defaultProps} activePreset="breaking-news" />);
      
      // Additional clicks on active preset should be prevented
      await user.click(breakingButton);
      await user.click(breakingButton);
      
      // Should still only be called once (duplicates prevented)
      expect(mockOnPresetApply).toHaveBeenCalledTimes(1);
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    test('has proper ARIA roles and properties', () => {
      render(<QuickFilterPresets {...defaultProps} />);
      
      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Quick Filter Presets');
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex');
      });
    });

    test('supports screen reader navigation', () => {
      render(<QuickFilterPresets {...defaultProps} activePreset="breaking-news" />);
      
      const activeButton = screen.getByText('BRK');
      expect(activeButton).toHaveAttribute('aria-pressed', 'true');
      
      const inactiveButton = screen.getByText('SOC');
      expect(inactiveButton).toHaveAttribute('aria-pressed', 'false');
    });

    test('provides clear focus indicators', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} />);
      
      const breakingButton = screen.getByText('BRK');
      await user.tab();
      
      expect(breakingButton).toHaveFocus();
    });

    test('announces preset changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} />);
      
      const breakingButton = screen.getByText('BRK');
      await user.click(breakingButton);
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent('Breaking preset applied');
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    test('handles empty preset list gracefully', () => {
      render(<QuickFilterPresets {...defaultProps} presets={[]} />);
      
      expect(screen.queryByText('BRK')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    test('handles preset with invalid filters', async () => {
      const invalidPresets: FilterPreset[] = [{
        id: 'invalid',
        name: 'Invalid',
        label: 'INV',
        filters: {} as FilterConfiguration,
        description: 'Invalid preset',
        color: '#ffffff'
      }];

      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} presets={invalidPresets} />);
      
      const invalidButton = screen.getByText('INV');
      await user.click(invalidButton);
      
      expect(mockOnPresetApply).toHaveBeenCalledWith('invalid');
    });

    test('handles missing preset labels', () => {
      const presetsWithoutLabels: FilterPreset[] = [{
        id: 'no-label',
        name: 'No Label',
        label: '',
        filters: { type: ['test'] },
        description: 'Preset without label',
        color: '#ffffff'
      }];

      render(<QuickFilterPresets {...defaultProps} presets={presetsWithoutLabels} />);
      
      // Should generate fallback label from name (first 3 chars)
      const button = screen.getByLabelText('Apply No Label preset');
      expect(button).toHaveTextContent('NO');
    });

    test('prevents duplicate preset activation', async () => {
      const user = userEvent.setup();
      render(<QuickFilterPresets {...defaultProps} activePreset="breaking-news" />);
      
      const breakingButton = screen.getByText('BRK');
      await user.click(breakingButton);
      
      // Should not call onPresetApply for already active preset
      expect(mockOnPresetApply).not.toHaveBeenCalled();
    });
  });

  // Integration Tests
  describe('Integration', () => {
    test('works with external filter state management', async () => {
      const user = userEvent.setup();
      let currentFilters: FilterConfiguration = {};
      
      const handlePresetApply = (presetId: string) => {
        const preset = defaultPresets.find(p => p.id === presetId);
        if (preset) {
          currentFilters = preset.filters;
          mockOnPresetApply(presetId);
        }
      };

      render(<QuickFilterPresets {...defaultProps} onPresetApply={handlePresetApply} />);
      
      const breakingButton = screen.getByText('BRK');
      await user.click(breakingButton);
      
      expect(currentFilters).toEqual({
        priority: ['high'],
        type: ['news'],
        timeRange: 'last-hour'
      });
    });

    test('maintains state consistency across re-renders', () => {
      const { rerender } = render(<QuickFilterPresets {...defaultProps} activePreset="breaking-news" />);
      
      expect(screen.getByText('BRK')).toHaveClass('active');
      
      rerender(<QuickFilterPresets {...defaultProps} activePreset="social-intel" />);
      
      expect(screen.getByText('BRK')).not.toHaveClass('active');
      expect(screen.getByText('SOC')).toHaveClass('active');
    });
  });
});
