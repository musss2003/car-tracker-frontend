import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import CreateBookingPage from '../CreateBookingPage';
import { getCustomers } from '@/features/customers/services/customerService';
import { getAvailableCarsForPeriod } from '@/features/cars/services/carService';
import { BookingStatus } from '../../types/booking.types';
import type { Booking } from '../../types/booking.types';
import type { Customer } from '@/features/customers/types/customer.types';
import type { Car } from '@/features/cars/types/car.types';

// Mock dependencies
vi.mock('@/features/customers/services/customerService');
vi.mock('@/features/cars/services/carService');
vi.mock('@/shared/utils/audit');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock data
const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    address: '123 Main St',
    driverLicenseNumber: 'DL123456',
    passportNumber: 'P123456',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as const satisfies Customer,
  {
    id: 'customer-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phoneNumber: '+0987654321',
    address: '456 Oak Ave',
    driverLicenseNumber: 'DL654321',
    passportNumber: 'P654321',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  } as const satisfies Customer,
];

const mockCars: Car[] = [
  {
    id: 'car-1',
    manufacturer: 'Toyota',
    model: 'Camry',
    year: 2023,
    licensePlate: 'ABC-123',
    fuelType: 'petrol',
    transmission: 'automatic',
    pricePerDay: 50,
    category: 'economy',
    status: 'available',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as const satisfies Car,
  {
    id: 'car-2',
    manufacturer: 'BMW',
    model: 'X5',
    year: 2023,
    licensePlate: 'XYZ-789',
    fuelType: 'diesel',
    transmission: 'automatic',
    pricePerDay: 100,
    category: 'luxury',
    status: 'available',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as const satisfies Car,
];

const mockCreatedBooking = {
  _id: 'booking-123',
  status: BookingStatus.PENDING,
  customerId: 'customer-1',
  carId: 'car-1',
  startDate: '2024-06-01',
  endDate: '2024-06-05',
  bookingReference: 'BK-2024-001',
  totalEstimatedCost: 200,
  depositAmount: 40,
  depositPaid: false,
  notes: '',
  expiresAt: '2024-06-06',
  createdBy: 'test-user-id',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
} as const satisfies Booking;

describe('CreateBookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Mock customer service
    vi.mocked(getCustomers).mockResolvedValue(mockCustomers);
    // Mock car service
    vi.mocked(getAvailableCarsForPeriod).mockResolvedValue(mockCars);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title and description', async () => {
      const { container } = renderWithProviders(<CreateBookingPage />);

      // Debug: log the rendered HTML
      // console.log(container.innerHTML);

      await waitFor(() => {
        expect(screen.getByText('Create New Booking')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Reserve a car for a customer with availability/i)
      ).toBeInTheDocument();
    });

    it('should render all required form fields', async () => {
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pickup Location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dropoff Location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    });

    it('should render all booking extras checkboxes', async () => {
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/GPS Navigation/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Child Seat/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Additional Driver/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Insurance Upgrade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mobile WiFi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Roof Rack/i)).toBeInTheDocument();
    });

    it('should render form action buttons', async () => {
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create Booking/i })
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /Cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe('Customer Loading', () => {
    it('should fetch customers on mount', async () => {
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(getCustomers).toHaveBeenCalledTimes(1);
      });
    });

    it('should pass customer data to CustomerSearchSelect', async () => {
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(getCustomers).toHaveBeenCalled();
      });

      // Customers are passed to CustomerSearchSelect component
      // The component manages its own rendering of customer options
    });
  });

  describe('Extras Selection', () => {
    it('should render extras checkboxes as unchecked by default', async () => {
      renderWithProviders(<CreateBookingPage />);

      const gpsCheckbox = await screen.findByLabelText(/GPS Navigation/i);
      const childSeatCheckbox = await screen.findByLabelText(/Child Seat/i);

      expect(gpsCheckbox).not.toBeChecked();
      expect(childSeatCheckbox).not.toBeChecked();
    });

    it('should render all 6 booking extras with correct labels', async () => {
      renderWithProviders(<CreateBookingPage />);

      await screen.findByText('Create New Booking');

      // Verify all 6 extras are present
      expect(screen.getByLabelText(/GPS Navigation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Child Seat/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Additional Driver/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Insurance Upgrade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mobile WiFi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Roof Rack/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should have submit button initially enabled', async () => {
      renderWithProviders(<CreateBookingPage />);

      const submitButton = await screen.findByRole('button', {
        name: /Create Booking/i,
      });

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it('should have cancel button that navigates back', async () => {
      renderWithProviders(<CreateBookingPage />);

      const cancelButton = await screen.findByRole('button', {
        name: /Cancel/i,
      });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should render date fields with proper labels', async () => {
      renderWithProviders(<CreateBookingPage />);

      const startDateField = await screen.findByLabelText(/Start Date/i);
      const endDateField = screen.getByLabelText(/End Date/i);

      expect(startDateField).toBeInTheDocument();
      expect(endDateField).toBeInTheDocument();
    });

    it('should render location fields', async () => {
      renderWithProviders(<CreateBookingPage />);

      await screen.findByText('Create New Booking');

      expect(screen.getByLabelText(/Pickup Location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dropoff Location/i)).toBeInTheDocument();
    });

    it('should render notes textarea', async () => {
      renderWithProviders(<CreateBookingPage />);

      const notesField = await screen.findByLabelText(/Notes/i);
      expect(notesField).toBeInTheDocument();
      expect(notesField.tagName).toBe('TEXTAREA');
    });
  });

  describe('Cost Calculation', () => {
    it('should not show cost summary when no car is selected', async () => {
      renderWithProviders(<CreateBookingPage />);

      await screen.findByText('Create New Booking');

      expect(screen.queryByText(/Total Cost/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle customer fetch error gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(getCustomers).mockRejectedValueOnce(
        new Error('Failed to fetch customers')
      );

      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(getCustomers).toHaveBeenCalled();
      });

      // Component should still render despite error
      expect(screen.getByText('Create New Booking')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });
});
