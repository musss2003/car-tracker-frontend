// src/setupTests.ts
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...(original as Record<string, unknown>), // ✅ Safely assert as a generic object type
    MemoryRouter: (original as { MemoryRouter: unknown }).MemoryRouter,
  };
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;
