import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
      v7_relativeSplatPath: true
    }
  });
  

beforeAll(() => {
    // Mock matchMedia for tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        dispatchEvent: vi.fn(),
      })),
    });
  });

// 🧪 Mock the useAuth hook
vi.mock('./contexts/useAuth', () => ({
    useAuth: () => ({
      isLoggedIn: () => true,
    }),
  }));
  
  describe('App Component', () => {
    it('should render the App component correctly', async () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
  
      // wait for main content to appear
      const mainContent = await screen.findByTestId('main-content');
      expect(mainContent).toBeInTheDocument();
    });
  });


function createBrowserRouter(routes: any, options: { future: { v7_startTransition: boolean; v7_relativeSplatPath: boolean; } }) {
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
