// src/__tests__/WeeklyMealPlannerPage.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import WeeklyMealPlannerPage from '../pages/WeeklyMealPlannerPage';

// --- 1. SETUP ROBUST MOCKS ---
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'testUser123' }
  })),
}));

// We mock onSnapshot to give us control over what it "sends back"
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
}));

vi.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'testUser123' } },
  db: "mockDb",
}));

// Import the function we want to control
import { onSnapshot } from 'firebase/firestore';

describe('WeeklyMealPlannerPage Component', () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should show the generation form when the profile is complete but no plan exists', async () => {
    // 2. Control the mock's behavior for this specific test
    onSnapshot.mockImplementation((docRef, callback) => {
      // Simulate fetching a COMPLETED profile
      callback({ exists: () => true, data: () => ({ age: 30, height: 180, weight: 75 }) });
      return () => {}; // Return an unsubscribe function
    });

    render(
      <BrowserRouter>
        <WeeklyMealPlannerPage />
      </BrowserRouter>
    );

    // 3. Assert that the form appears after loading
    const formHeading = await screen.findByText(/Create Your Weekly Meal Plan/i);
    expect(formHeading).toBeInTheDocument();
  });
  
  it('should display the "Complete Your Profile" message if profile is incomplete', async () => {
    // 4. Control the mock's behavior for THIS test
    onSnapshot.mockImplementation((docRef, callback) => {
      // Simulate fetching an INCOMPLETE profile
      callback({ exists: () => true, data: () => ({ age: '' }) });
      return () => {}; // Return an unsubscribe function
    });

    render(
      <BrowserRouter>
        <WeeklyMealPlannerPage />
      </BrowserRouter>
    );
    
    // 5. Assert that the warning message appears after loading
    const profileMessage = await screen.findByText(/Complete Your Profile to Continue/i);
    expect(profileMessage).toBeInTheDocument();
  });
});