/**
 * COMPREHENSIVE UI TESTS - 100 Critical Test Suite
 * Priority 5: Header Component (Tests 71-80)
 * Focus: Navigation, branding, responsive behavior
 */

import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Header from '../../src/components/Header';

// Mock Web3Button component
jest.mock('../../src/components/web3/Web3Button', () => {
  return function MockWeb3Button() {
    return <button data-testid="web3-button">Connect Wallet</button>;
  };
});

// Test wrapper with router
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('🎯 UI COMPREHENSIVE TESTS - Header Component (Tests 71-80)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🎨 Branding & Layout (Tests 71-75)', () => {
    test('UI_071: Should render Header component', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      const header = document.querySelector('.header');
      expect(header).toBeInTheDocument();
    });

    test('UI_072: Should display Wing Commander logo', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      const logo = document.querySelector('.header .logo img');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('alt', 'Wing Commander Logo');
    });

    test('UI_073: Should display application title', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      expect(screen.getByText('TACTICAL INTEL DASHBOARD')).toBeInTheDocument();
    });

    test('UI_074: Should have proper header styling classes', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      const header = document.querySelector('.header');
      expect(header).toHaveClass('header');
      
      const logo = document.querySelector('.logo');
      expect(logo).toBeInTheDocument();
      
      const title = document.querySelector('.title');
      expect(title).toBeInTheDocument();
    });

    test('UI_075: Should have navigation section', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      const nav = document.querySelector('.navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('🧭 Navigation Links (Tests 76-80)', () => {
    test('UI_076: Should have Home navigation link', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    test('UI_077: Should have Settings navigation', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      // Settings might be a button or link
      const settingsElement = screen.getByText(/settings/i);
      expect(settingsElement).toBeInTheDocument();
    });

    test('UI_078: Should include Web3 Button', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('web3-button')).toBeInTheDocument();
    });

    test('UI_079: Should handle navigation clicks', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);
      
      // Should not throw error on click
      expect(homeLink).toBeInTheDocument();
    });

    test('UI_080: Should maintain header layout on different screen sizes', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );
      
      const header = document.querySelector('.header');
      
      // Should have flex display for responsive layout
      const computedStyle = window.getComputedStyle(header!);
      expect(computedStyle.display).toBe('flex');
    });
  });
});
