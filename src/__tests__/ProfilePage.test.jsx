import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';

// 🔹 Mock Firebase Core Modules
vi.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'testUser123', email: 'test@user.com' } },
  db: {},
}));

// 🔹 Mock Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn((ref, callback) => {
    // simulate Firestore returning empty data on mount
    callback({ exists: () => false, data: () => ({}) });
    return vi.fn(); // mock unsubscribe
  }),
  setDoc: vi.fn(() => Promise.resolve()),
}));

// 🔹 Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/photo.jpg')),
}));

// Helper: render with router wrapper
const renderWithRouter = () =>
  render(
    <BrowserRouter>
      <ProfilePage />
    </BrowserRouter>
  );

describe('ProfilePage (Simple Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- TEST 1: Component Renders ---
  it('renders the profile page with headings', async () => {
    renderWithRouter();
    expect(await screen.findByText(/Your Profile Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Profile/i)).toBeInTheDocument();
  });

  // --- TEST 2: Input Interaction ---
  it('allows typing in the Name input field', async () => {
    renderWithRouter();
    const nameInput = await screen.findByLabelText(/Name/i);

    // Initially empty
    expect(nameInput.value).toBe('');

    // Simulate typing
    fireEvent.change(nameInput, { target: { value: 'Keerthi Kumar' } });
    expect(nameInput.value).toBe('Keerthi Kumar');
  });

  // --- TEST 3: Submit Form Updates Firestore ---
  it('calls setDoc when form is submitted', async () => {
    const { setDoc } = await import('firebase/firestore');
    renderWithRouter();

    const nameInput = await screen.findByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    const saveButton = screen.getByRole('button', { name: /Save Profile/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    });
  });

  // --- TEST 4: Image Upload Updates Firestore ---
  it('uploads an image and updates Firestore', async () => {
    const { uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { setDoc } = await import('firebase/firestore');

    renderWithRouter();

    // Simulate choosing a file
    const fileInput = await screen.findByLabelText(/Change Photo/i);
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
    });
  });
});
