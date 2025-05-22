import { render, screen } from "@testing-library/react";
import HomePage from "main/pages/HomePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("HomePage tests", () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.restore(); // Restore original axios instance, remove the mock adapter
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    // Mock /api/currentUser as it might be called by AppNavbar or HomePage's useCurrentUser
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly); // Default to a logged-in state

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByText(/Welcome to RecManager/);
  });

  test("renders correctly when user is logged out", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/currentUser").reply(403, null); // Mock for logged out user
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText(/Welcome to RecManager/);
    expect(
      screen.getByText(
        /Please log in to start viewing and managing recommendation requests./,
      ),
    ).toBeInTheDocument();
  });

  test("renders correctly when user is logged in", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly); // Mock for logged in user
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText(/Welcome to RecManager/);
    // Use findByText for the assertion itself to handle async content appearance
    const loggedInMessage = await screen.findByText(
      /Use the navigation bar above to access pending requests, completed requests, and view recommendation statistics./,
    );
    expect(loggedInMessage).toBeInTheDocument();
  });
});
