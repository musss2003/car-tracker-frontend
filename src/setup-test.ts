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

// Mock URL.createObjectURL and revokeObjectURL for file handling
URL.createObjectURL = vi.fn((blob: Blob) => `blob:${Date.now()}`);
URL.revokeObjectURL = vi.fn();

// Mock fetch API globally for auth session checks
vi.stubGlobal(
  'fetch',
  vi.fn((url: string | URL | Request, options?: RequestInit) => {
    const urlString = typeof url === 'string' ? url : url.toString();

    // Mock auth session check to always return authenticated immediately
    if (urlString.includes('/api/auth/session-check')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            authenticated: true,
            id: 'test-user-id',
            username: 'testuser',
            email: 'test@example.com',
            role: 'ADMIN',
          }),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        formData: () => Promise.resolve(new FormData()),
      } as Response);
    }

    // Default mock for other requests
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
    } as Response);
  })
);
