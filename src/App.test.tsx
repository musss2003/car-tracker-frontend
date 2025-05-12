import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('should render the App component correctly', () => {
    render(<App />);

    // Check if certain elements are rendered
    expect(screen.getByText('Welcome to the App')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
