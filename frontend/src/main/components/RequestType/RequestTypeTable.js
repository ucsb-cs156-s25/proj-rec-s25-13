import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/RequestTypeUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function RequestTypeTable({ requests, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/requests/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  // when delete success, invalidate the correct query key (depending on user role)
  const apiEndpoint = hasRole(currentUser, "ROLE_PROFESSOR")
    ? "/api/admin/users/professor/all"
    : "/api/admin/users/requester/all";

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    [apiEndpoint],
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

  //since all admins have the role of a user, we can just check if the current user has the role ROLE_USER
  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "RequestTypeTable"),
    );
  }

  if (
    hasRole(currentUser, "ROLE_USER") &&
    !hasRole(currentUser, "ROLE_ADMIN")
  ) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "RequestTypeTable"),
    );
  }

  return (
    <OurTable data={requests} columns={columns} testid={"RequestTypeTable"} />
  );
}
