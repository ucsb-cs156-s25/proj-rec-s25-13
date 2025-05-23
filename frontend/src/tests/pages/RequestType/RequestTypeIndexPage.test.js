import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RequestTypeIndexPage from "main/pages/RequestType/RequestTypeIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import mockConsole from "jest-mock-console";
import { requestFixtures } from "fixtures/requestFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("RequestTypeIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "RequestTypeTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupProfessorUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.professorUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/requesttypes/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create RequestType/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create RequestType/);
    expect(button).toHaveAttribute("href", "/requesttypes/post");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("Renders with Create Button for professor user", async () => {
    setupProfessorUser();
    axiosMock.onGet("/api/requesttypes/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create RequestType/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create RequestType/);
    expect(button).toHaveAttribute("href", "/requesttypes/post");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders four request types correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/requesttypes/all")
      .reply(200, requestFixtures.fourTypes);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    const createRequestTypeButton = screen.queryByText("Create RequestType");
    expect(createRequestTypeButton).not.toBeInTheDocument();

    const requestType = screen.getByText("CS Department BS/MS program");
    expect(requestType).toBeInTheDocument();

    // for non-admin users, details button is visible, but the edit and delete buttons should not be visible
    expect(
      screen.queryByTestId("RequestTypeTable-cell-row-0-col-Delete-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("RequestTypeTable-cell-row-0-col-Edit-button"),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/requesttypes/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/requesttypes/all",
    );
    restoreConsole();
  });

  const relatedRoles = [
    ["professor", apiCurrentUserFixtures.professorUser],
    ["admin", apiCurrentUserFixtures.adminUser],
  ];

  test.each(relatedRoles)(
    "renders Create Button for %s user (has ROLE_%s)",
    async (_name, fakeUser) => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock.onGet("/api/currentUser").reply(200, fakeUser);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingBoth);

      axiosMock.onGet("/api/requesttypes/all").reply(200, []);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RequestTypeIndexPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const btn = await screen.findByText(/Create RequestType/);
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute("href", "/requesttypes/post");
      expect(btn).toHaveStyle({ float: "right" });
    },
  );

  test("does NOT render Create Button for plain userOnly (no prof, no admin)", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/requesttypes/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText(/Create RequestType/)).not.toBeInTheDocument();
    });
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/requesttypes/all")
      .reply(200, requestFixtures.fourTypes);
    axiosMock
      .onDelete("/api/requesttypes")
      .reply(200, "RequestType with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith("RequestType with id 1 was deleted");
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/requesttypes");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });

  test("what happens when you click delete, professor", async () => {
    setupProfessorUser();

    axiosMock
      .onGet("/api/requesttypes/all")
      .reply(200, requestFixtures.fourTypes);
    axiosMock
      .onDelete("/api/requesttypes")
      .reply(200, "RequestType with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith("RequestType with id 1 was deleted");
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/requesttypes");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
