// src/__tests__/ProfilePage.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';

// --- MOCK SETUP ---
// This mock is correct for your ProfilePage component, which uses getDoc.
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn(), // We will control this function in each test
    setDoc: vi.fn(() => Promise.resolve()),
  };
});

vi.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'testUser123' } },
  db: "mockDb",
}));

// Import the mocked functions we want to control
import { getDoc, setDoc } from 'firebase/firestore';

describe('ProfilePage Component', () => {

  beforeEach(() => {
    // Resetting mocks before each test ensures they don't interfere with each other.
    vi.clearAllMocks();
  });

  // --- TEST 1 (Existing) ---
  it('should display existing data and allow typing', async () => {
    // ARRANGE: Pretend the user has a profile with a name.
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Initial Name' })
    });

    render(<BrowserRouter><ProfilePage /></BrowserRouter>);

    // ACT & ASSERT: Wait for the data to load and check the input's value.
    const nameInput = await screen.findByDisplayValue('Initial Name');
    expect(nameInput).toBeInTheDocument();
    
    // ACT: Simulate typing.
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    
    // ASSERT: Check that the input updated.
    expect(nameInput.value).toBe('John Doe');
  });

  // --- NEW TEST 2: Checking the "empty state" for a new user ---
  it('should display empty fields if no profile data exists', async () => {
    // ARRANGE: Pretend this is a brand new user.
    getDoc.mockResolvedValue({ exists: () => false });

    render(<BrowserRouter><ProfilePage /></BrowserRouter>);
    await screen.findByRole('heading', { name: /Your Profile/i });
    
    // ASSERT: Check that the name and age fields start empty.
    expect(screen.getByLabelText(/Name/i).value).toBe('');
    expect(screen.getByLabelText(/Age/i).value).toBe('');
  });

  // --- NEW TEST 3: Checking a dropdown menu interaction ---
  it('should allow changing the activity level dropdown', async () => {
    // ARRANGE: Pretend the user has an existing profile.
    getDoc.mockResolvedValue({ 
      exists: () => true, 
      data: () => ({ activityLevel: 'sedentary' }) 
    });

    render(<BrowserRouter><ProfilePage /></BrowserRouter>);

    // Find the dropdown by its label.
    const activitySelect = await screen.findByLabelText(/Activity Level/i);
    
    // ASSERT: Check its initial value.
    expect(activitySelect.value).toBe('sedentary');
    
    // ACT: Simulate the user selecting a new option.
    fireEvent.change(activitySelect, { target: { value: 'moderately_active' } });
    
    // ASSERT: Check that the dropdown's value has changed.
    expect(activitySelect.value).toBe('moderately_active');
  });

  // --- TEST 4 (Existing, but now enhanced) ---
  it('should call setDoc with correct data and show a success message on save', async () => {
    // ARRANGE: Pretend this is a new user.
    getDoc.mockResolvedValue({ exists: () => false });

    render(<BrowserRouter><ProfilePage /></BrowserRouter>);
    await screen.findByRole('heading', { name: /Your Profile/i });

    // ACT: Simulate the user filling out the form.
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '32' } });
    fireEvent.change(screen.getByLabelText(/Height \(cm\)/i), { target: { value: '165' } });

    // ACT: Simulate the user clicking the "Save Profile" button.
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));

    // ASSERT: Check that the save function was called with the right data.
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        undefined, // docRef is mocked
        expect.objectContaining({
          name: 'Jane Doe',
          age: 32,
          height: 165,
        }),
        { merge: true }
      );
    });

    // ASSERT: Check that the user sees a success message.
    expect(await screen.findByText('Profile updated successfully!')).toBeInTheDocument();
  });
});