import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/RequestTypeUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function RequestTypeTable({ requestTypes, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/requesttypes/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/requesttypes/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "Request Type",
      accessor: "requestType",
    },
  ];

  // only professors can delete / edit
  if (
    hasRole(currentUser, "ROLE_PROFESSOR") ||
    hasRole(currentUser, "ROLE_ADMIN")
  ) {
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "RequestTypeTable"),
    );
  }

  if (
    hasRole(currentUser, "ROLE_PROFESSOR") ||
    hasRole(currentUser, "ROLE_ADMIN")
  ) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "RequestTypeTable"),
    );
  }

  return (
    <OurTable
      data={requestTypes}
      columns={columns}
      testid={"RequestTypeTable"}
    />
  );
}
