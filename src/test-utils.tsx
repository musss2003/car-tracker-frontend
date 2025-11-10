import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import UserProvider from './features/auth/hooks/useAuth';

/**
 * Custom render function that wraps components with necessary providers
 *
 * @example
 * import { renderWithProviders } from '@/test-utils';
 *
 * test('renders component', () => {
 *   renderWithProviders(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
  withAuth?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    routerProps = {},
    withAuth = true,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const content = withAuth ? (
      <UserProvider>{children}</UserProvider>
    ) : (
      children
    );

    return <MemoryRouter {...routerProps}>{content}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Render with router only (no auth context)
 */
export function renderWithRouter(
  ui: ReactElement,
  routerProps?: MemoryRouterProps
) {
  return renderWithProviders(ui, { routerProps, withAuth: false });
}

/**
 * Mock localStorage for tests
 */
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  global.localStorage = localStorageMock as any;
  return localStorageMock;
};

/**
 * Mock matchMedia for tests (required for responsive components)
 */
export const mockMatchMedia = () => {
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
};

/**
 * Mock fetch API for tests
 */
export const mockFetch = (response: any = {}, status: number = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  );
};

/**
 * Create a mock user object for testing
 */
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'user' as const,
  ...overrides,
});

/**
 * Create a mock contract object for testing
 */
export const createMockContract = (overrides = {}) => ({
  id: 1,
  customerId: 1,
  carId: 1,
  startDate: '2025-01-01',
  endDate: '2025-01-07',
  totalPrice: 500,
  status: 'active' as const,
  ...overrides,
});

/**
 * Create a mock car object for testing
 */
export const createMockCar = (overrides = {}) => ({
  id: 1,
  brand: 'Toyota',
  model: 'Camry',
  year: 2023,
  licensePlate: 'ABC-123',
  pricePerDay: 50,
  status: 'available' as const,
  ...overrides,
});

/**
 * Create a mock customer object for testing
 */
export const createMockCustomer = (overrides = {}) => ({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  ...overrides,
});

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
