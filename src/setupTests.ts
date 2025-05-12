import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import '@testing-library/jest-dom';

vi.mock("react-router-dom", async () => {
    const original = await import("react-router-dom");
    return {
      ...original,
      MemoryRouter,
    };
  });

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }),
});
global.ResizeObserver = class {
    observe() { }
    unobserve() { }
    disconnect() { }
};

