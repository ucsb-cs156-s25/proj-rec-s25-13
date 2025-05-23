import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";

export default function UsersTable({ users }) {
  // Stryker disable all : hard to test for query caching
  // Stryker enable all

  const queryClient = useQueryClient();

  //toggleAdmin
  function cellToAxiosParamsToggleAdmin(cell) {
    return {
      url: "/api/admin/users/toggleAdmin",
      method: "POST",
      params: {
        id: cell.row.values.id,
      },
    };
  }

  // Custom mutation that handles errors without the default Axios error
  const toggleAdminMutation = useMutation(
    async (cell) => {
      try {
        const params = cellToAxiosParamsToggleAdmin(cell);
        const response = await axios(params);
        return response.data;
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast(`Error: ${error.response.data.message}`);
        } else {
          toast(`Error: ${error.message || "Unknown error occurred"}`);
        }
        throw error; // Re-throw to maintain error state in mutation
      }
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries(["/api/admin/users"]);
      },
      retry: false,
    },
  );

  // Stryker disable next-line all : TODO try to make a good test for this
  const toggleAdminCallback = async (cell) => {
    toggleAdminMutation.mutate(cell);
  };

  function cellToAxiosParamsToggleProfessor(cell) {
    return {
      url: "/api/admin/users/toggleProfessor",
      method: "POST",
      params: {
        id: cell.row.values.id,
      },
    };
  }

  // Stryker disable all : hard to test for query caching
  const toggleProfessorMutation = useBackendMutation(
    cellToAxiosParamsToggleProfessor,
    {},
    ["/api/admin/users"],
  );
  // Stryker enable all

  // Stryker disable next-line all : TODO try to make a good test for this
  const toggleProfessorCallback = async (cell) => {
    toggleProfessorMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "First Name",
      accessor: "givenName",
    },
    {
      Header: "Last Name",
      accessor: "familyName",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Admin",
      id: "admin",
      accessor: (row, _rowIndex) => String(row.admin), // hack needed for boolean values to show up
    },
    {
      Header: "Professor",
      id: "professor",
      accessor: (row, _rowIndex) => String(row.professor), // hack needed for boolean values to show up
    },
  ];

  const buttonColumn = [
    ...columns,
    ButtonColumn("Toggle Admin", "primary", toggleAdminCallback, "UsersTable"),
    ButtonColumn(
      "Toggle Professor",
      "success",
      toggleProfessorCallback,
      "UsersTable",
    ),
  ];

  return <OurTable data={users} columns={buttonColumn} testid={"UsersTable"} />;
}
