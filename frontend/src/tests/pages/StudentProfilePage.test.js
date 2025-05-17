import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import StudentProfilePage from "main/pages/StudentProfilePage";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";
import { useBackend } from "main/utils/useBackend";

// Mock useBackend to verify the correct parameters
jest.mock("main/utils/useBackend", () => {
  const originalModule = jest.requireActual("main/utils/useBackend");
  return {
    __esModule: true,
    ...originalModule,
    useBackend: jest.fn(),
  };
});

// Mock the BasicLayout and AppNavbar components
jest.mock("main/layouts/BasicLayout/BasicLayout", () => {
  return ({ children }) => <div data-testid="BasicLayout">{children}</div>;
});

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, "location", {
  writable: true,
  value: { reload: mockReload },
});

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({ ok: true }));

// Mock RecommendationRequestTable
jest.mock(
  "main/components/RecommendationRequest/RecommendationRequestTable",
  () => {
    return ({ requests, _currentUser, onEdit, onDelete }) => (
      <div data-testid="RecommendationRequestTable">
        {requests?.map((request) => (
          <div key={request.id}>
            <span>{request.requester.email}</span>
            <button
              data-testid={`edit-button-${request.id}`}
              onClick={() => onEdit && onEdit(request)}
            >
              Edit
            </button>
            <button
              data-testid={`delete-button-${request.id}`}
              onClick={() => onDelete && onDelete(request)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  },
);

describe("StudentProfilePage tests", () => {
  const queryClient = new QueryClient();
  const navigateMock = jest.fn();
  let axiosMock;
  let fetchMock;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    useNavigate.mockReturnValue(navigateMock);
    global.fetch.mockClear();
    mockReload.mockClear();
    navigateMock.mockClear();

    // Reset the mock implementation to return a default value
    useBackend.mockImplementation(() => ({
      data: [],
      error: null,
      status: "success",
    }));
  });

  afterEach(() => {
    if (fetchMock) fetchMock.mockRestore();
    jest.clearAllMocks();
  });

  test("useBackend is called with the correct parameters", async () => {
    // Setup the mock implementation
    useBackend.mockImplementation(() => {
      return {
        data: recommendationRequestFixtures.oneRecommendation,
        error: null,
        status: "success",
      };
    });

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    fetchMock = jest.spyOn(global, "fetch").mockImplementation(async (url) => {
      if (url === "/api/admin/users/professors") {
        return {
          ok: true,
          status: 200,
          json: async () => usersFixtures.twoProfessors,
        };
      }
      if (url === "/api/requesttypes/all") {
        return {
          ok: true,
          status: 200,
          json: async () => recommendationTypeFixtures.fourTypes,
        };
      }
      // Fallback for unexpected fetch calls
      console.error(`Unhandled fetch call to ${url}`);
      return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Verify that useBackend was called with the correct parameters
    await waitFor(() => {
      // Check that the endpoint parameter is correct and non-empty
      expect(useBackend).toHaveBeenCalledWith(
        ["/api/recommendationrequest/requester/all"],
        expect.objectContaining({
          method: "GET",
          url: "/api/recommendationrequest/requester/all",
        }),
        expect.any(Array),
      );
    });

    // Check specific parameters to kill mutants
    const useBackendCalls = useBackend.mock.calls;

    // Verify that the first parameter is the correct non-empty array
    expect(useBackendCalls[0][0]).toEqual([
      "/api/recommendationrequest/requester/all",
    ]);
    expect(useBackendCalls[0][0]).not.toEqual([]);
    expect(useBackendCalls[0][0]).not.toEqual([""]);

    // Verify that the method parameter is "GET" and not empty
    expect(useBackendCalls[0][1].method).toBe("GET");
    expect(useBackendCalls[0][1].method).not.toBe("");

    // Verify the third parameter (dependency array)
    expect(useBackendCalls[0][2]).toEqual([]);
    expect(useBackendCalls[0][2]).not.toEqual(["Stryker was here"]);
  });

  test("renders correctly for regular logged in user", async () => {
    useBackend.mockImplementation(() => {
      return {
        data: recommendationRequestFixtures.oneRecommendation,
        error: null,
        status: "success",
      };
    });

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    fetchMock = jest.spyOn(global, "fetch").mockImplementation(async (url) => {
      if (url === "/api/admin/users/professors") {
        return {
          ok: true,
          status: 200,
          json: async () => usersFixtures.twoProfessors,
        };
      }
      if (url === "/api/requesttypes/all") {
        return {
          ok: true,
          status: 200,
          json: async () => recommendationTypeFixtures.fourTypes,
        };
      }
      // Fallback for unexpected fetch calls
      console.error(`Unhandled fetch call to ${url}`);
      return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("BasicLayout");
    expect(screen.getByText("Create New Request")).toBeInTheDocument();
  });

  test("renders request data and checks edit functionality", async () => {
    const requestsData = [
      {
        id: 1,
        requester: { fullName: "Student Name", email: "test@example.com" },
        professor: { fullName: "Professor Name", email: "prof@example.com" },
        recommendationType: "Letter of Recommendation",
        details: "Test details",
        status: "Pending",
      },
    ];

    useBackend.mockImplementation(() => {
      return {
        data: requestsData,
        error: null,
        status: "success",
      };
    });

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    fetchMock = jest.spyOn(global, "fetch").mockImplementation(async (url) => {
      if (url === "/api/admin/users/professors") {
        return {
          ok: true,
          status: 200,
          json: async () => usersFixtures.twoProfessors,
        };
      }
      if (url === "/api/requesttypes/all") {
        return {
          ok: true,
          status: 200,
          json: async () => recommendationTypeFixtures.fourTypes,
        };
      }
      // Fallback for unexpected fetch calls
      console.error(`Unhandled fetch call to ${url}`);
      return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("RecommendationRequestTable");

    // Find and click the edit button
    const editButton = await screen.findByTestId("edit-button-1");
    fireEvent.click(editButton);

    expect(navigateMock).toHaveBeenCalledWith("/requests/edit/1");
  });

  test("checks delete functionality", async () => {
    const requestsData = [
      {
        id: 2,
        requester: { fullName: "Student Name", email: "test@example.com" },
        professor: { fullName: "Professor Name", email: "prof@example.com" },
        recommendationType: "Letter of Recommendation",
        details: "Test details",
        status: "Pending",
      },
    ];

    useBackend.mockImplementation(() => {
      return {
        data: requestsData,
        error: null,
        status: "success",
      };
    });

    // Mock successful delete response
    global.fetch.mockImplementation(() => Promise.resolve({ ok: true }));

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("RecommendationRequestTable");

    // Find and click the delete button
    const deleteButton = await screen.findByTestId("delete-button-2");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/recommendationrequest?id=2",
        { method: "DELETE" },
      );
    });

    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled();
    });
  });

  test("checks create new request button", async () => {
    useBackend.mockImplementation(() => {
      return {
        data: [],
        error: null,
        status: "success",
      };
    });

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("BasicLayout");

    // Find and click the create new request button
    const createButton = screen.getByText("Create New Request");
    fireEvent.click(createButton);

    expect(navigateMock).toHaveBeenCalledWith("/requests/create");
  });
});
