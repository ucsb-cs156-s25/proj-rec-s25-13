import { useTable, useSortBy } from "react-table";
import { Table, Button, Dropdown } from "react-bootstrap";

export default function OurTable({ columns, data, testid = "testid" }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data }, useSortBy);

  return (
    <Table {...getTableProps()} striped bordered hover>
      <thead>
        {headerGroups.map((headerGroup, i) => (
          <tr
            {...headerGroup.getHeaderGroupProps()}
            data-testid={`${testid}-header-group-${i}`}
            // Stryker disable next-line StringLiteral : React key property not exposed in dom
            key={`${testid}-header-group-${i}`}
          >
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps(column.getSortByToggleProps())}
                data-testid={`${testid}-header-${column.id}`}
                // Stryker disable next-line StringLiteral : React key property not exposed in dom
                key={`${testid}-header-${column.id}`}
              >
                {column.render("Header")}
                <span data-testid={`${testid}-header-${column.id}-sort-carets`}>
                  {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          const rowTestId = `${testid}-row-${row.index}`;
          return (
            <tr
              {...row.getRowProps()}
              data-testid={rowTestId}
              // Stryker disable next-line StringLiteral : React key property not exposed in dom
              key={rowTestId}
            >
              {row.cells.map((cell, _index) => {
                const testId = `${testid}-cell-row-${cell.row.index}-col-${cell.column.id}`;
                return (
                  <td
                    {...cell.getCellProps()}
                    data-testid={testId}
                    // Stryker disable next-line StringLiteral : React key property not exposed in dom
                    key={testId}
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

// The callback function for ButtonColumn should have the form
// (cell) => { doSomethingWith(cell); }
// The fields in cell are:
//   ["column","row","value","getCellProps","render"]
// Documented here: https://react-table.tanstack.com/docs/api/useTable#cell-properties
// Typically, you want cell.row.values, which is where you can get the individual
//   fields of the object representing the row in the table.
// Example:
//   const deleteCallback = (cell) =>
//      toast(`Delete Callback called on id: ${cell.row.values.id} name: ${cell.row.values.name}`);

// Add it to table like this:
// const columns = [
//   {
//       Header: 'id',
//       accessor: 'id', // accessor is the "key" in the data
//   },
//   {
//       Header: 'Name',
//       accessor: 'name',
//   },
//   ButtonColumn("Edit", "primary", editCallback),
//   ButtonColumn("Delete", "danger", deleteCallback)
// ];

export function ButtonColumn(label, variant, callback, testid) {
  const column = {
    Header: label,
    id: label,
    Cell: ({ cell }) => (
      <Button
        variant={variant}
        onClick={() => callback(cell)}
        data-testid={`${testid}-cell-row-${cell.row.index}-col-${cell.column.id}-button`}
      >
        {label}
      </Button>
    ),
  };
  return column;
}

export function ButtonDropdownColumn(label, variant, callback, testid) {
  const column = {
    Header: label,
    id: label,
    Cell: ({ cell }) => (
      <Dropdown className="dropdown-cell-wrapper">
        <Dropdown.Toggle
          variant={variant}
          data-testid={`${testid}-cell-row-${cell.row.index}-col-${cell.column.id}-dropdown`}
        >
          Update
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {cell.row.original.status === "PENDING" && (
            <>
              <Dropdown.Item onClick={() => callback.Accept(cell)}>
                Accept
              </Dropdown.Item>
              <Dropdown.Item onClick={() => callback.Deny(cell)}>
                Deny
              </Dropdown.Item>
            </>
          )}

          {cell.row.original.status === "IN PROGRESS" && (
            <Dropdown.Item onClick={() => callback.Complete(cell)}>
              Complete
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    ),
  };
  return column;
}
