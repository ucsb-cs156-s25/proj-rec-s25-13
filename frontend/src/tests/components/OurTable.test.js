import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import OurTable, {
  ButtonColumn,
  ButtonDropdownColumn,
} from "main/components/OurTable";

describe("OurTable tests", () => {
  const threeRows = [
    {
      col1: "Hello",
      col2: "World",
    },
    {
      col1: "react-table",
      col2: "rocks",
    },
    {
      col1: "whatever",
      col2: "you want",
    },
  ];

  const clickMeCallback = jest.fn();

  const columns = [
    {
      Header: "Column 1",
      accessor: "col1", // accessor is the "key" in the data
    },
    {
      Header: "Column 2",
      accessor: "col2",
    },
    {
      Header: "Status",
      accessor: "status",
    },
    ButtonColumn("Click", "primary", clickMeCallback, "testId"),
  ];

  test("renders an empty table without crashing", () => {
    render(<OurTable columns={columns} data={[]} />);
  });

  test("renders a table with three rows with correct test ids", async () => {
    render(<OurTable columns={columns} data={threeRows} />);

    await waitFor(() => {
      expect(screen.getByTestId("testid-header-group-0")).toBeInTheDocument();
    });
    expect(screen.getByTestId("testid-header-col1")).toBeInTheDocument();
    expect(screen.getByTestId("testid-header-col2")).toBeInTheDocument();
    expect(screen.getByTestId("testid-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("testid-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("testid-row-2")).toBeInTheDocument();
  });

  test("The button appears in the table", async () => {
    render(<OurTable columns={columns} data={threeRows} />);

    await screen.findByTestId("testId-cell-row-0-col-Click-button");
    const button = screen.getByTestId("testId-cell-row-0-col-Click-button");
    fireEvent.click(button);
    await waitFor(() => expect(clickMeCallback).toBeCalledTimes(1));
  });

  test("default testid is testId", async () => {
    render(<OurTable columns={columns} data={threeRows} />);
    await screen.findByTestId("testid-header-col1");
  });

  test("click on a header and a sort caret should appear", async () => {
    render(
      <OurTable columns={columns} data={threeRows} testid={"sampleTestId"} />,
    );

    await screen.findByTestId("sampleTestId-header-col1");
    const col1Header = screen.getByTestId("sampleTestId-header-col1");

    const col1SortCarets = screen.getByTestId(
      "sampleTestId-header-col1-sort-carets",
    );
    expect(col1SortCarets).toHaveTextContent("");

    const col1Row0 = screen.getByTestId("sampleTestId-cell-row-0-col-col1");
    expect(col1Row0).toHaveTextContent("Hello");

    fireEvent.click(col1Header);
    await screen.findByText("🔼");

    fireEvent.click(col1Header);
    await screen.findByText("🔽");
  });
});

describe("ButtonDropdownColumn tests", () => {
  const mockAccept = jest.fn();
  const mockDeny = jest.fn();
  const mockComplete = jest.fn();

  const columns = [
    {
      Header: "Column 1",
      accessor: "col1", // accessor is the "key" in the data
    },
    {
      Header: "Column 2",
      accessor: "col2",
    },
    ButtonDropdownColumn(
      "Update",
      "info",
      { Accept: mockAccept, Deny: mockDeny, Complete: mockComplete },
      "testId",
    ),
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("The dropdown appears in the table", async () => {
    const rows = [{ id: 5, status: "PENDING" }];
    render(<OurTable columns={columns} data={rows} />);

    await screen.findByTestId("testId-cell-row-0-col-Update-dropdown");
    const dropdown = screen.getByTestId(
      "testId-cell-row-0-col-Update-dropdown",
    );
    expect(dropdown).toBeInTheDocument();
  });

  test("The dropdown shows Accept and Deny buttons when request is PENDING", async () => {
    const rows = [{ id: 5, status: "PENDING" }];
    render(<OurTable columns={columns} data={rows} />);

    await screen.findByTestId("testId-cell-row-0-col-Update-dropdown");
    const dropdown = screen.getByTestId(
      "testId-cell-row-0-col-Update-dropdown",
    );
    fireEvent.click(dropdown);

    expect(await screen.findByText("Accept")).toBeInTheDocument();
    expect(await screen.findByText("Deny")).toBeInTheDocument();
  });

  test("Clicking accept/deny invokes correct callbacks", async () => {
    const rows = [{ id: 5, status: "PENDING" }];
    render(<OurTable columns={columns} data={rows} />);

    await screen.findByTestId("testId-cell-row-0-col-Update-dropdown");
    const dropdown = screen.getByTestId(
      "testId-cell-row-0-col-Update-dropdown",
    );
    fireEvent.click(dropdown);

    await screen.findByText("Accept");
    const accept = screen.getByText("Accept");
    await screen.findByText("Deny");
    const deny = screen.getByText("Deny");

    fireEvent.click(accept);
    await waitFor(() => expect(mockAccept).toBeCalledTimes(1));

    fireEvent.click(deny);
    await waitFor(() => expect(mockDeny).toBeCalledTimes(1));
  });

  test("The dropdown shows Complete button when request is IN PROGRESS", async () => {
    const rows = [{ id: 5, status: "IN PROGRESS" }];
    render(<OurTable columns={columns} data={rows} />);

    await screen.findByTestId("testId-cell-row-0-col-Update-dropdown");
    const dropdown = screen.getByTestId(
      "testId-cell-row-0-col-Update-dropdown",
    );
    fireEvent.click(dropdown);

    expect(await screen.findByText("Complete")).toBeInTheDocument();
  });

  test("Clicking complete invokes correct callback", async () => {
    const rows = [{ id: 5, status: "IN PROGRESS" }];
    render(<OurTable columns={columns} data={rows} />);

    await screen.findByTestId("testId-cell-row-0-col-Update-dropdown");
    const dropdown = screen.getByTestId(
      "testId-cell-row-0-col-Update-dropdown",
    );
    fireEvent.click(dropdown);

    await screen.findByText("Complete");
    const complete = screen.getByText("Complete");

    fireEvent.click(complete);
    await waitFor(() => expect(mockComplete).toBeCalledTimes(1));
  });

  test("for PENDING status, Comoplete should not render", async () => {
    const rows = [{ id: 5, status: "PENDING" }];
    render(<OurTable columns={columns} data={rows} />);

    await screen.findByTestId("testId-cell-row-0-col-Update-dropdown");
    const dropdown = screen.getByTestId(
      "testId-cell-row-0-col-Update-dropdown",
    );
    fireEvent.click(dropdown);

    expect(screen.queryByText("Complete")).not.toBeInTheDocument();
  });

  test("for IN PROGRESS status, Accept and Deny should not render", async () => {
    const rows = [{ id: 5, status: "IN PROGRESS" }];
    render(<OurTable columns={columns} data={rows} />);

    await screen.findByTestId("testId-cell-row-0-col-Update-dropdown");
    const dropdown = screen.getByTestId(
      "testId-cell-row-0-col-Update-dropdown",
    );
    fireEvent.click(dropdown);

    expect(screen.queryByText("Accept")).not.toBeInTheDocument();
    expect(screen.queryByText("Deny")).not.toBeInTheDocument();
  });
});
