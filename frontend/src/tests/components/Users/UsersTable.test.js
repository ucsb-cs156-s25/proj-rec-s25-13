import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
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

describe("UserTable tests", () => {
  const queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);

  test("renders without crashing for empty table", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("renders without crashing for three users", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("Has the expected colum headers and content", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "First Name",
      "Last Name",
      "Email",
      "Admin",
      "Professor",
    ];
    const expectedFields = [
      "id",
      "givenName",
      "familyName",
      "email",
      "admin",
      "professor",
    ];
    const testId = "UsersTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-admin`),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-professor`),
    ).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-admin`),
    ).toHaveTextContent("false");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-professor`),
    ).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-professor`),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-admin`),
    ).toHaveTextContent("false");
  });

  test("toggling professor", async () => {
    const currentUser = usersFixtures.adminUser;

    axiosMock
      .onPost("/api/admin/users/toggleProfessor", {
        params: { id: 1 },
      })
      .reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable
            users={usersFixtures.threeUsers}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const profButton = screen.getByTestId(
      `UsersTable-cell-row-0-col-Toggle Professor-button`,
    );
    expect(profButton).toBeInTheDocument();

    fireEvent.click(profButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });

    expect(axiosMock.history.post[0].url).toBe(
      "/api/admin/users/toggleProfessor",
    );

    expect(axiosMock.history.post[0].params).toEqual({ id: 1 });
  });

  test("toggling admin", async () => {
    const currentUser = usersFixtures.adminUser;

    axiosMock
      .onPost("/api/admin/users/toggleStudent", {
        params: { id: 1 },
      })
      .reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable
            users={usersFixtures.threeUsers}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const adminButton = screen.getByTestId(
      `UsersTable-cell-row-0-col-Toggle Admin-button`,
    );
    expect(adminButton).toBeInTheDocument();

    fireEvent.click(adminButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(2);
    });

    expect(axiosMock.history.post[1].url).toBe("/api/admin/users/toggleAdmin");

    expect(axiosMock.history.post[1].params).toEqual({ id: 1 });
  });
});
