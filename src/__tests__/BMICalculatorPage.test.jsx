// src/__tests__/BMICalculatorPage.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BMICalculatorPage from '../pages/BMICalculatorPage';

// --- THIS IS THE COMPLETE AND CORRECT MOCK ---
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: vi.fn(),
    onSnapshot: vi.fn(), // Mock the real-time listener
    addDoc: vi.fn(() => Promise.resolve()),
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    getDocs: vi.fn(), // Also mock getDocs for the reset history function
    writeBatch: vi.fn(() => ({
      delete: vi.fn(),
      commit: vi.fn(() => Promise.resolve()),
    })),
  };
});

vi.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'testUser123' } },
  db: "mockDb",
}));

// Import the mocked function we want to control
import { onSnapshot } from 'firebase/firestore';

describe('BMICalculatorPage Component', () => {

  beforeEach(() => {
    // Reset mocks before each test to ensure they are isolated
    vi.clearAllMocks();

    // Provide a default implementation for onSnapshot for every test
    onSnapshot.mockImplementation((query, callback) => {
      callback({ docs: [] }); // Simulate empty history by default
      return () => {}; // Return a fake unsubscribe function
    });
  });

  it('should calculate the BMI and display the correct value and category', async () => {
    render(
      <BrowserRouter>
        <BMICalculatorPage user={{ uid: 'testUser123' }} />
      </BrowserRouter>
    );

    // Now that the component is accessible, this will work correctly
    const heightInput = screen.getByLabelText(/Height \(cm\)/i);
    const weightInput = screen.getByLabelText(/Weight \(kg\)/i);
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });

    // Simulate user input
    fireEvent.change(heightInput, { target: { value: '175' } });
    fireEvent.change(weightInput, { target: { value: '72' } });

    // Simulate clicking the calculate button
    fireEvent.click(calculateButton);

    // Assert that the correct results appear on the screen
    const bmiValue = await screen.findByText('23.51');
    const bmiCategory = await screen.findByText('Normal weight');

    expect(bmiValue).toBeInTheDocument();
    expect(bmiCategory).toBeInTheDocument();
  });
});