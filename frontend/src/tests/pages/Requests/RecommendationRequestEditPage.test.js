import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import RecommendationRequestEditPage from "main/pages/Requests/RecommendationRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

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
    useParams: () => ({
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("RecommendationRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    let fetchMock;

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .timeout();

      // Add fetch mock here too, as the form might still try to render and fetch
      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(async (url) => {
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
          console.error(
            `Unhandled fetch call in 'backend doesn't return data' suite: ${url}`,
          );
          return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
        });
    });

    afterEach(() => {
      if (fetchMock) {
        fetchMock.mockRestore();
      }
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequest-requesterEmail"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    let fetchMock;

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);

      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(async (url) => {
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
          console.error(
            `Unhandled fetch call in 'backend working normally' suite: ${url}`,
          );
          return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
        });
    });

    afterEach(() => {
      if (fetchMock) {
        fetchMock.mockRestore();
      }
    });

    const queryClient = new QueryClient();

    test("renders, allows editing, and submits updated data", async () => {
      const initialRequestData = {
        id: 17,
        professor: {
          id: usersFixtures.twoProfessors[0].id,
          fullName: usersFixtures.twoProfessors[0].fullName,
        },
        recommendationType: recommendationTypeFixtures.fourTypes[0].requestType,
        details: "Initial details for editing",
        dueDate: "2025-01-15T12:00:00",
      };
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .reply(200, initialRequestData);

      const updatedRequestData = {
        id: 17,
        professorId: usersFixtures.twoProfessors[1].id.toString(),
        recommendationType: recommendationTypeFixtures.fourTypes[1].requestType,
        details: "Updated details after editing",
        dueDate: "2025-02-20T00:00:00",
      };
      axiosMock.onPut("/api/recommendationrequest").reply(200, {
        id: 17,
        professor: {
          id: parseInt(updatedRequestData.professorId),
          fullName: "Updated Prof Name",
        },
        recommendationType: updatedRequestData.recommendationType,
        details: updatedRequestData.details,
        dueDate: updatedRequestData.dueDate,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(screen.getByLabelText("Professor")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByLabelText("Due Date")).toHaveValue("2025-01-15");
      });

      await waitFor(() => {
        expect(screen.getByLabelText("Details")).toHaveValue(
          "Initial details for editing",
        );
      });

      await waitFor(() => {
        expect(
          screen.getByDisplayValue(usersFixtures.twoProfessors[0].fullName),
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        const recommendationTypeSelect = screen.getByLabelText(
          "Recommendation Type",
        );
        expect(recommendationTypeSelect).toHaveValue("Other");
      });

      expect(fetchMock).toHaveBeenCalledWith("/api/admin/users/professors");
      expect(fetchMock).toHaveBeenCalledWith("/api/requesttypes/all");

      const professorSelect = screen.getByLabelText("Professor");
      const recommendationTypeSelect = screen.getByLabelText(
        "Recommendation Type",
      );
      const detailsInput = screen.getByLabelText("Details");
      const dueDateInput = screen.getByLabelText("Due Date");
      const submitButton = screen.getByRole("button", { name: "Update" });

      fireEvent.change(professorSelect, {
        target: { value: usersFixtures.twoProfessors[1].id.toString() },
      });
      fireEvent.change(recommendationTypeSelect, {
        target: { value: recommendationTypeFixtures.fourTypes[1].requestType },
      });
      fireEvent.change(detailsInput, {
        target: { value: "Updated details after editing" },
      });
      fireEvent.change(dueDateInput, { target: { value: "2025-02-20" } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          "Recommendation Request Updated - id: 17",
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/profile" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });

      const expectedPutData = {
        professorId: usersFixtures.twoProfessors[1].id.toString(),
        recommendationType: recommendationTypeFixtures.fourTypes[1].requestType,
        details: "Updated details after editing",
        dueDate: "2025-02-20T00:00:00",
      };
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual(
        expectedPutData,
      );
    });

    test("handles missing professor in initial data", async () => {
      // Mock the API call to return a recommendation request without professor property
      const requestWithoutProfessor = {
        id: 17,
        recommendationType: "Other",
        details: "Request details",
        dueDate: "2023-01-01T12:00:00",
      };

      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .reply(200, requestWithoutProfessor);

      render(
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        const heading = screen.getByText("Edit Recommendation Request");
        expect(heading).toBeInTheDocument();
      });

      await waitFor(() => {
        const idField = screen.getByTestId("RecommendationRequestForm-id");
        expect(idField).toBeInTheDocument();
      });

      await waitFor(() => {
        const idField = screen.getByTestId("RecommendationRequestForm-id");
        expect(idField).toHaveValue("17");
      });
    });
  });
});
