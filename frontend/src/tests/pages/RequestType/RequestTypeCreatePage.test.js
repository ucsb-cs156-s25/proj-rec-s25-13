import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RequestTypeCreatePage from "main/pages/RequestType/RequestTypeCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

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

describe("RequestTypeCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/admin/users/professors")
      .reply(200, apiCurrentUserFixtures.professorUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RequestTypeForm-requestType"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const requestTypes = {
      id: 17,
      requestType: "Inqueries",
    };

    axiosMock.onPost("/api/requesttypes/post").reply(202, requestTypes);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RequestTypeForm-requestType"),
      ).toBeInTheDocument();
    });

    const requestTypeField = screen.getByTestId("RequestTypeForm-requestType");
    const submitButton = screen.getByTestId("RequestTypeForm-submit");

    fireEvent.change(requestTypeField, {
      target: { value: "Inqueries" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requestType: "Inqueries",
    });

    expect(mockToast).toBeCalledWith(
      "New requestType Created - id: 17 request type: Inqueries",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/requesttypes/all" });
  });
});
