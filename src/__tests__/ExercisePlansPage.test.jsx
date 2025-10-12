// src/__tests__/ExercisePlansPage.test.jsx

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ExercisePlansPage from '../pages/ExercisePlansPage';

// --- MOCK SETUP ---
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(), // We will control this function
  };
});

vi.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'testUser123' } },
  db: "mockDb",
}));

import { getDocs } from 'firebase/firestore';

describe('ExercisePlansPage Component', () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should display plans for the "Overweight" category if the user\'s BMI is 27', async () => {
    // 1. Control the mock: Simulate fetching a BMI of 27
    getDocs.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ bmi: 27 }) }],
    });

    render(
      <BrowserRouter>
        <ExercisePlansPage />
      </BrowserRouter>
    );

    // 2. Wait for the correct plan to appear on the screen
    // "Foundation Fitness" is the plan for the "Overweight" category in your JSON file.
    const planTitle = await screen.findByText('Foundation Fitness');
    expect(planTitle).toBeInTheDocument();

    // 3. Also, assert that a plan for a different category does NOT appear
    const otherPlanTitle = screen.queryByText('Full-Body Fitness Maintenance');
    expect(otherPlanTitle).not.toBeInTheDocument();
  });

  it('should show the "NoData" message if the user has no BMI history', async () => {
    // 4. Control the mock: Simulate finding no BMI entries
    getDocs.mockResolvedValue({ empty: true, docs: [] });

    render(
      <BrowserRouter>
        <ExercisePlansPage />
      </BrowserRouter>
    );

    // 5. Assert that the correct prompt is shown to the user
    const noDataMessage = await screen.findByText(/Unlock Your Personalized Exercise Plans/i);
    expect(noDataMessage).toBeInTheDocument();
  });

});