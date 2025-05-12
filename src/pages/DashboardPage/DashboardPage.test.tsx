import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "./DashboardPage";

test("renders dashboard content", () => {
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});
