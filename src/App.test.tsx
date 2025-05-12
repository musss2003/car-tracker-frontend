import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "./contexts/useAuth";
import App from "./App";

test("renders main app structure", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <UserProvider>
        <App />
      </UserProvider>
    </MemoryRouter>
  );

  expect(screen.getByRole("main")).toBeInTheDocument();
});
