// src/__tests__/DailyTip.test.jsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DailyTip from '../components/DailyTip'; // Adjust the import path

describe('DailyTip Component', () => {

  it('should render the "Tip of the Day" heading', () => {
    // 1. Render the component in a virtual DOM
    render(<DailyTip />);

    // 2. Find an element by its text content (case-insensitive)
    // The 'screen' object represents the rendered output.
    const headingElement = screen.getByText(/Tip of the Day/i);

    // 3. Assert that the element is actually present in the document
    expect(headingElement).toBeInTheDocument();
  });

  it('should render a tip that is a non-empty string', () => {
    render(<DailyTip />);
    
    // Find an element by its text content using a regular expression.
    // This finds any text enclosed in double quotes.
    const tipText = screen.getByText(/"(.*)"/);

    // Assert that the tip element is present
    expect(tipText).toBeInTheDocument();
    // A simple check to ensure the tip has content
    expect(tipText.textContent.length).toBeGreaterThan(5); 
  });

});