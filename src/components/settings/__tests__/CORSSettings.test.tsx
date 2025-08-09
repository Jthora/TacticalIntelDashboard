import '@testing-library/jest-dom';

import { beforeEach,describe, expect, it, jest } from '@jest/globals';
import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';

import { CORSStrategy,SettingsProvider } from '../../../contexts/SettingsContext';
import { CORSSettings } from '../tabs/CORSSettings';

describe('CORSSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = () => {
    return render(
      <SettingsProvider>
        <CORSSettings />
      </SettingsProvider>
    );
  };

  it('renders correctly with default settings', () => {
    renderWithProvider();
    
    // Check heading
    expect(screen.getByText('CORS Management')).toBeInTheDocument();
    
    // Check strategy dropdown
    const strategySelect = screen.getByLabelText('Default CORS Strategy');
    expect(strategySelect).toBeInTheDocument();
    expect(strategySelect).toHaveValue(CORSStrategy.RSS2JSON);
    
    // Check protocol-specific strategies
    expect(screen.getByText('Protocol-Specific Strategies')).toBeInTheDocument();
    expect(screen.getAllByText('Use Default Strategy').length).toBeGreaterThan(0);
    
    // Check services section
    expect(screen.getByText('RSS2JSON Service Configuration')).toBeInTheDocument();
    expect(screen.getByText('Available Services:')).toBeInTheDocument();
    expect(screen.getByText('CORS Proxies:')).toBeInTheDocument();
    
    // Check reset button
    expect(screen.getByText('Reset CORS Settings')).toBeInTheDocument();
  });

  it('changes the default CORS strategy', () => {
    renderWithProvider();
    
    const strategySelect = screen.getByLabelText('Default CORS Strategy');
    fireEvent.change(strategySelect, { target: { value: CORSStrategy.DIRECT } });
    
    // Check if value was updated
    expect(strategySelect).toHaveValue(CORSStrategy.DIRECT);
  });

  it('changes protocol-specific strategy', () => {
    renderWithProvider();
    
    // Find the RSS protocol strategy dropdown
    const rssStrategySelect = screen.getByLabelText('RSS');
    
    // Initially it should be 'DEFAULT'
    expect(rssStrategySelect).toHaveValue('DEFAULT');
    
    // Change it to DIRECT
    fireEvent.change(rssStrategySelect, { target: { value: CORSStrategy.DIRECT } });
    
    // Check if value was updated
    expect(rssStrategySelect).toHaveValue(CORSStrategy.DIRECT);
  });

  it('resets settings when reset button is clicked', () => {
    renderWithProvider();
    
    // Change default strategy
    const strategySelect = screen.getByLabelText('Default CORS Strategy');
    fireEvent.change(strategySelect, { target: { value: CORSStrategy.DIRECT } });
    
    // Change a protocol-specific strategy
    const rssStrategySelect = screen.getByLabelText('RSS');
    fireEvent.change(rssStrategySelect, { target: { value: CORSStrategy.JSONP } });
    
    // Click reset button
    const resetButton = screen.getByText('Reset CORS Settings');
    fireEvent.click(resetButton);
    
    // Verify settings are reset
    expect(strategySelect).toHaveValue(CORSStrategy.RSS2JSON);
    expect(rssStrategySelect).toHaveValue('DEFAULT');
  });
});
