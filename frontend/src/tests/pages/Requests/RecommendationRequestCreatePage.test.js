import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/Requests/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";

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

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  let fetchMock;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
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
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Professor")).toBeInTheDocument();
    });

    // Verify fetch calls were made
    expect(fetch).toHaveBeenCalledWith("/api/admin/users/professors");
    expect(fetch).toHaveBeenCalledWith("/api/requesttypes/all");
  });

  test("on submit, makes request to backend, and redirects to /profile", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      id: 7,
      professorId: 3,
      reccomendationType: "CS Department BS/MS program",
      details: "many details",
      dueDate: "1111-11-11T11:11:11",
    };

    axiosMock
      .onPost("/api/recommendationrequest/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Professor")).toBeInTheDocument();
      // Ensure select options are populated from mocked fetch
    });
    expect(
      screen.getByText(usersFixtures.twoProfessors[0].fullName),
    ).toBeInTheDocument();
    expect(
      screen.getByText(recommendationTypeFixtures.fourTypes[0].requestType),
    ).toBeInTheDocument();

    const professorIdInput = screen.getByLabelText("Professor");
    expect(professorIdInput).toBeInTheDocument();

    const reccomendationTypeInput = screen.getByLabelText(
      "Recommendation Type",
    );
    expect(reccomendationTypeInput).toBeInTheDocument();

    const detailsInput = screen.getByLabelText("Details");
    expect(detailsInput).toBeInTheDocument();

    const dueDateInput = screen.getByLabelText("Due Date");
    expect(dueDateInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(professorIdInput, { target: { value: "1" } });
    fireEvent.change(reccomendationTypeInput, {
      target: { value: "PhD program" },
    });
    fireEvent.change(detailsInput, { target: { value: "new details" } });
    fireEvent.change(dueDateInput, { target: { value: "2222-11-11" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      professorId: "1",
      recommendationType: "PhD program",
      details: "new details",
      dueDate: "2222-11-11T00:00:00",
    });
    expect(mockToast).toHaveBeenCalledWith(
      "New recommendationRequest Created - id: 7",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/profile" });
  });
});
