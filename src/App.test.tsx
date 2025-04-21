import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the auth util
vi.mock('./utils/auth', () => ({
  isLoggedIn: () => false,
}));

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
