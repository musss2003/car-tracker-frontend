import { BookingEvent, Car } from "../types/Car";
import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/";

export const getCar = async (carId: string): Promise<Car> => {
  const response = await fetch(`${API_URL}cars/${carId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Error getting car: ${response.statusText}`);
  return await response.json();
};

export const getCars = async (): Promise<Car[]> => {
  const response = await fetch(`${API_URL}cars`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Error getting all cars: ${response.statusText}`);
  return await response.json();
};

export const updateCar = async (license_plate: string, car: Car): Promise<Car> => {
  const response = await fetch(`${API_URL}cars/${license_plate}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(car),
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Error updating car: ${response.statusText}`);
  return await response.json();
};

export const deleteCar = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}cars/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Error deleting car: ${response.statusText}`);
  return await response.json();
};

export const addCar = async (car: Car): Promise<Car> => {
  const response = await fetch(`${API_URL}cars`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(car),
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Error adding car: ${response.statusText}`);
  return await response.json();
};

export const getAvailableCarsForPeriod = async (
  startingDate: string,
  endingDate: string
): Promise<Car[]> => {
  const response = await fetch(`${API_URL}cars/available`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ startingDate, endingDate }),
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Error fetching available cars: ${response.statusText}`);
  return await response.json();
};

export const getCarAvailability = async (licensePlate: string): Promise<BookingEvent[]> => {
  // Replace with actual API logic when ready
  return mockAvailability;
};

const mockAvailability: BookingEvent[] = [
    {
      id: "1", // ✅ Add this line
      start: new Date(2025, 3, 24),
      end: new Date(2025, 3, 26),
      title: "Reserved by Customer A",
      contractId: "1",
      customerName: "Customer A",
      status: "confirmed"
    }
  ];
  