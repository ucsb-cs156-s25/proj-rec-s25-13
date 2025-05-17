import { render, screen } from "@testing-library/react";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";
import { QueryClient, QueryClientProvider } from "react-query";

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("renders without crashing for empty table", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UsersTable users={[]} />
      </QueryClientProvider>,
    );
  });

  test("renders without crashing for three users", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UsersTable users={usersFixtures.threeUsers} />
      </QueryClientProvider>,
    );
  });

  test("Has the expected colum headers and content", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UsersTable users={usersFixtures.threeUsers} />
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
});
