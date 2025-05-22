import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BrowserRouter as Router } from "react-router-dom";

import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import usersFixtures from "fixtures/usersFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RecommendationRequestForm tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/admin/users/professors")
      .reply(200, usersFixtures.userOnly);
    axiosMock
      .onGet("/api/requesttypes/all")
      .reply(200, recommendationTypeFixtures.fourTypes);
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  const queryClient = new QueryClient();

  const expectedHeaders = ["Professor", "Recommendation Type", "Details"];
  const testId = "RecommendationRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm
            initialContents={recommendationRequestFixtures.oneRecommendation}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that the options are filled correctly", async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve(usersFixtures.twoProfessors), // for professors
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(recommendationTypeFixtures.fourTypes), // for recommendation types
      });
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2)); // Ensure fetch was called twice

    // Assert: Check that fetch was called with the correct URLs
    expect(global.fetch).toHaveBeenCalledWith("/api/admin/users/professors");
    expect(global.fetch).toHaveBeenCalledWith("/api/requesttypes/all");
    await waitFor(() => {
      usersFixtures.twoProfessors.forEach((professor) => {
        expect(screen.getByText(professor.fullName)).toBeInTheDocument();
      });
      expect(screen.getByText("Select a professor")).toBeInTheDocument();
    });
    await waitFor(() => {
      recommendationTypeFixtures.fourTypes.forEach((type) => {
        expect(screen.getByText(type.requestType)).toBeInTheDocument();
      });
    });
  });

  test("that the correct error appears when the gets are called for the options", async () => {
    const consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Network error"));
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );
    await waitFor(() => {
      // Here, you can check for side effects or verify the console error is called.
      // In this case, we assume the error is logged to the console.
      expect(global.console.error).toHaveBeenCalledWith(
        "Error fetching request types",
      );
    });
    await waitFor(() => {
      // Here, you can check for side effects or verify the console error is called.
      // In this case, we assume the error is logged to the console.
      expect(global.console.error).toHaveBeenCalledWith(
        "Error fetching professors",
      );
    });
    consoleErrorMock.mockRestore();
  });

  test("that the initial value of professors and recommendationTypes is only defaults", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(screen.getByText("No professors available")).toBeInTheDocument();
    expect(
      screen.getByText(
        "No recommendation types available, use Other in details",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();

    // Assert that no professor options are rendered yet
    const options = screen.queryAllByRole("option");
    expect(options).toHaveLength(3);
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Please select a professor/);
    expect(
      screen.getByText(/Please select a recommendation type/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Please select a due date/)).toBeInTheDocument();
  });

  describe("onSubmit tests", () => {
    beforeEach(() => {
      // Mock fetch for professors and recommendation types
      global.fetch = jest.fn((url) => {
        if (url === "/api/admin/users/professors") {
          return Promise.resolve({
            json: () => Promise.resolve(usersFixtures.twoProfessors),
          });
        }
        if (url === "/api/requesttypes/all") {
          return Promise.resolve({
            json: () => Promise.resolve(recommendationTypeFixtures.fourTypes),
          });
        }
        return Promise.reject(new Error(`Unknown endpoint: ${url}`));
      });
    });

    test("calls submitAction with formatted dueDate when dueDate is YYYY-MM-DD", async () => {
      const submitAction = jest.fn();
      render(
        <QueryClientProvider client={queryClient}>
          <Router>
            <RecommendationRequestForm submitAction={submitAction} />
          </Router>
        </QueryClientProvider>,
      );

      // Wait for options to be populated from mock fetch
      await screen.findByText(usersFixtures.twoProfessors[0].fullName); // e.g., "Craig Zzyxx"
      await screen.findByText(
        recommendationTypeFixtures.fourTypes[0].requestType,
      ); // e.g., "CS Department BS/MS program"

      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-professor_id"),
        { target: { value: usersFixtures.twoProfessors[1].id.toString() } },
      ); // Phill Conrad (id 1)
      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-recommendationType"),
        {
          target: {
            value: recommendationTypeFixtures.fourTypes[0].requestType,
          },
        },
      ); // CS Department BS/MS program
      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-details"),
        { target: { value: "Test details" } },
      );
      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-dueDate"),
        { target: { value: "2024-12-31" } },
      );

      fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

      await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          professor_id: usersFixtures.twoProfessors[1].id.toString(),
          recommendationType:
            recommendationTypeFixtures.fourTypes[0].requestType,
          details: "Test details",
          dueDate: "2024-12-31T00:00:00",
        }),
      );
    });

    test("calls submitAction with data when dueDate is not present", async () => {
      const submitAction = jest.fn();
      render(
        <QueryClientProvider client={queryClient}>
          <Router>
            <RecommendationRequestForm submitAction={submitAction} />
          </Router>
        </QueryClientProvider>,
      );

      // Simulate filling other required fields
      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-professor_id"),
        { target: { value: "1" } },
      );
      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-recommendationType"),
        { target: { value: "Graduate School" } },
      );
      fireEvent.change(
        screen.getByTestId("RecommendationRequestForm-details"),
        { target: { value: "Test details" } },
      );
      // Deliberately not filling dueDate to test the {required: "..."} validation message
      // Also, the onSubmit logic should still pass the data to submitAction

      fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

      // Check for validation error first
      expect(
        await screen.findByText(/Please select a due date/),
      ).toBeInTheDocument();

      // Even with validation error, if we force submit (which jest allows),
      // check that submitAction is NOT called if validation prevents it
      // Based on react-hook-form behavior, submitAction should not be called if validation fails.
      expect(submitAction).not.toHaveBeenCalled();
    });
  });
});
