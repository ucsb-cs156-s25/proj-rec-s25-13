import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import AdminUsersPage from "main/pages/AdminRequestsPage";
import usersFixtures from "fixtures/usersFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import mockConsole from "jest-mock-console";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import AdminRequestsPage from "main/pages/AdminRequestsPage";

describe("AdminUsersPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "RequestsTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing on three users", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/recommendationrequests/admin").reply(200, recommendationRequestFixtures.threeRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByText("Recommendation Requests");
  });

  test("renders empty table when backend unavailable", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/recommendationrequests/admin").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminRequestsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/recommendationrequests/admin",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });
});
