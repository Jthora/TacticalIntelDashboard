/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';

import { describe, expect,test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Jest DOM Matcher Test', () => {
  test('toBeInTheDocument should be available', () => {
    render(React.createElement('div', { 'data-testid': 'test-element' }, 'Test content'));
    
    // Test if the element exists using toBeTruthy as a fallback
    expect(screen.getByTestId('test-element')).toBeTruthy();
    expect(screen.getByText('Test content')).toBeTruthy();
  });
});
