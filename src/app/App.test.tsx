import { screen } from '@testing-library/react';
import {
  renderWithProviders,
  mockMatchMedia,
  mockLocalStorage,
} from '../test-utils';
import App from './App';

// Define routes for the application
const routes = [
  {
    path: '/',
    element: <App />,
  },
  // Add more routes as needed
];

createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

beforeAll(() => {
  // Mock matchMedia for tests
  mockMatchMedia();

  // Mock localStorage
  mockLocalStorage();
});

describe('App Component', () => {
  it('should render the App component correctly', () => {
    renderWithProviders(<App />);

    // Check that the app wrapper is rendered (since auth might show loading screen)
    const heading = screen.getByRole('heading', { name: /car tracker/i });
    expect(heading).toBeInTheDocument();
  });
});

function createBrowserRouter(
  routes: any,
  options: {
    future: { v7_startTransition: boolean; v7_relativeSplatPath: boolean };
  }
) {
  // Simulate creating a router with the provided routes and options
  return {
    routes,
    options,
    navigate: (path: string) => {
      console.log(`Navigating to ${path}`);
    },
    getRoutes: () => routes,
  };
}
