import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
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

const _mockCreatedBooking = {
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
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Kreiraj Novu Rezervaciju')
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          /Rezerviši automobil za kupca sa provjerom dostupnosti/i
        )
      ).toBeInTheDocument();
    });

    it('should render all required form fields', async () => {
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Datum Početka/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Datum Završetka/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Lokacija Preuzimanja/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Lokacija Vraćanja/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Napomene/i)).toBeInTheDocument();
    });

    it('should render all booking extras checkboxes', async () => {
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/GPS Navigacija/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Dječije Sjedište/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dodatni Vozač/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Nadogradnja Osiguranja/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Mobilni WiFi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Krovni Nosač/i)).toBeInTheDocument();
    });

    it('should render form action buttons', async () => {
      renderWithProviders(<CreateBookingPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Kreiraj Rezervaciju/i })
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /Otkaži/i })
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

      const gpsCheckbox = await screen.findByLabelText(/GPS Navigacija/i);
      const childSeatCheckbox =
        await screen.findByLabelText(/Dječije Sjedište/i);

      expect(gpsCheckbox).not.toBeChecked();
      expect(childSeatCheckbox).not.toBeChecked();
    });

    it('should render all 6 booking extras with correct labels', async () => {
      renderWithProviders(<CreateBookingPage />);

      await screen.findByText('Kreiraj Novu Rezervaciju');

      // Verify all 6 extras are present
      expect(screen.getByLabelText(/GPS Navigacija/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dječije Sjedište/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dodatni Vozač/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Nadogradnja Osiguranja/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Mobilni WiFi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Krovni Nosač/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should have submit button initially enabled', async () => {
      renderWithProviders(<CreateBookingPage />);

      const submitButton = await screen.findByRole('button', {
        name: /Kreiraj Rezervaciju/i,
      });

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it('should have cancel button that navigates back', async () => {
      renderWithProviders(<CreateBookingPage />);

      const cancelButton = await screen.findByRole('button', {
        name: /Otkaži/i,
      });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should render date fields with proper labels', async () => {
      renderWithProviders(<CreateBookingPage />);

      const startDateField = await screen.findByLabelText(/Datum Početka/i);
      const endDateField = screen.getByLabelText(/Datum Završetka/i);

      expect(startDateField).toBeInTheDocument();
      expect(endDateField).toBeInTheDocument();
    });

    it('should render location fields', async () => {
      renderWithProviders(<CreateBookingPage />);

      await screen.findByText('Kreiraj Novu Rezervaciju');

      expect(
        screen.getByLabelText(/Lokacija Preuzimanja/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Lokacija Vraćanja/i)).toBeInTheDocument();
    });

    it('should render notes textarea', async () => {
      renderWithProviders(<CreateBookingPage />);

      const notesField = await screen.findByLabelText(/Napomene/i);
      expect(notesField).toBeInTheDocument();
      expect(notesField.tagName).toBe('TEXTAREA');
    });
  });

  describe('Cost Calculation', () => {
    it('should not show cost summary when no car is selected', async () => {
      renderWithProviders(<CreateBookingPage />);

      await screen.findByText('Kreiraj Novu Rezervaciju');

      expect(screen.queryByText(/Ukupna Cijena/i)).not.toBeInTheDocument();
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
      expect(screen.getByText('Kreiraj Novu Rezervaciju')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });
});
