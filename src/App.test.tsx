import { render, screen } from "@testing-library/react";
import { UserProvider } from "./contexts/useAuth";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "./App";

// Mock auth
vi.mock("./utils/auth", () => ({
  isLoggedIn: () => false,
}));

// ✅ Correct async mocking of lazy page
vi.mock("./pages/LoginPage", async () => {
  return {
    default: () => <div>Mock Login Page</div>,
  };
});

test("renders login page when not logged in", () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <UserProvider>
        <App />
      </UserProvider>
    </MemoryRouter>
  );

  const loginText = screen.getByText(/mock login page/i);
  expect(loginText).toBeInTheDocument();
});
