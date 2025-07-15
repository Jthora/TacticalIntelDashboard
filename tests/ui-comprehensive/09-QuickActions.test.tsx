/**
 * ADDITIONAL UI TESTS - QuickActions Component
 * Focus: Action buttons, export functionality, refresh controls
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import QuickActions from '../../src/components/QuickActions';

describe('🎯 ADDITIONAL UI TESTS - QuickActions Component', () => {
  const mockOnRefreshAll = jest.fn();
  const mockOnExportData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔧 Basic Structure', () => {
    test('Should render QuickActions component', () => {
      render(
        <QuickActions 
          selectedFeedList="1"
          onRefreshAll={mockOnRefreshAll}
          onExportData={mockOnExportData}
        />
      );
      
      const quickActions = document.querySelector('.quick-actions');
      expect(quickActions).toBeInTheDocument();
    });

    test('Should display action buttons', () => {
      render(
        <QuickActions 
          selectedFeedList="1"
          onRefreshAll={mockOnRefreshAll}
          onExportData={mockOnExportData}
        />
      );
      
      expect(screen.getByText(/refresh/i)).toBeInTheDocument();
      expect(screen.getByText(/export/i)).toBeInTheDocument();
    });

    test('Should handle null selectedFeedList', () => {
      render(
        <QuickActions 
          selectedFeedList={null}
          onRefreshAll={mockOnRefreshAll}
          onExportData={mockOnExportData}
        />
      );
      
      // Should still render but maybe with disabled state
      const quickActions = document.querySelector('.quick-actions');
      expect(quickActions).toBeInTheDocument();
    });
  });

  describe('🎛️ Action Handling', () => {
    test('Should call onRefreshAll when refresh button clicked', async () => {
      const user = userEvent.setup();
      render(
        <QuickActions 
          selectedFeedList="1"
          onRefreshAll={mockOnRefreshAll}
          onExportData={mockOnExportData}
        />
      );
      
      const refreshButton = screen.getByText(/refresh/i);
      await user.click(refreshButton);
      
      expect(mockOnRefreshAll).toHaveBeenCalledTimes(1);
    });

    test('Should call onExportData when export button clicked', async () => {
      const user = userEvent.setup();
      render(
        <QuickActions 
          selectedFeedList="1"
          onRefreshAll={mockOnRefreshAll}
          onExportData={mockOnExportData}
        />
      );
      
      const exportButton = screen.getByText(/export/i);
      await user.click(exportButton);
      
      expect(mockOnExportData).toHaveBeenCalledTimes(1);
    });

    test('Should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      render(
        <QuickActions 
          selectedFeedList="1"
          onRefreshAll={mockOnRefreshAll}
          onExportData={mockOnExportData}
        />
      );
      
      const refreshButton = screen.getByText(/refresh/i);
      
      // Rapid clicks
      await user.click(refreshButton);
      await user.click(refreshButton);
      await user.click(refreshButton);
      
      expect(mockOnRefreshAll).toHaveBeenCalledTimes(3);
    });

    test('Should maintain button state after interactions', async () => {
      const user = userEvent.setup();
      render(
        <QuickActions 
          selectedFeedList="1"
          onRefreshAll={mockOnRefreshAll}
          onExportData={mockOnExportData}
        />
      );
      
      const refreshButton = screen.getByText(/refresh/i);
      const exportButton = screen.getByText(/export/i);
      
      await user.click(refreshButton);
      await user.click(exportButton);
      
      // Buttons should still be clickable
      expect(refreshButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
    });

    test('Should display proper icons or indicators', () => {
      render(
        <QuickActions 
          selectedFeedList="1"
          onRefreshAll={mockOnRefreshAll}
          onExportData={mockOnExportData}
        />
      );
      
      // Check for button icons or styling
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });
});
