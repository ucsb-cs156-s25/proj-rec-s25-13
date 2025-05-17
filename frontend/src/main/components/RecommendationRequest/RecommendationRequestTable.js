import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/RecommendationRequestUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function RecommendationRequestTable({ requests, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/requests/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  // when delete success, invalidate the correct query key (depending on user role)
  const apiEndpoint = hasRole(currentUser, "ROLE_PROFESSOR")
    ? "/api/recommendationrequest/professor/all"
    : "/api/recommendationrequest/requester/all";

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
      Header: "Professor Name",
      accessor: "professor.fullName",
    },
    {
      Header: "Professor Email",
      accessor: "professor.email",
    },
    {
      Header: "Requester Name",
      accessor: "requester.fullName",
    },
    {
      Header: "Requester Email",
      accessor: "requester.email",
    },
    {
      Header: "Recommendation Type",
      accessor: "recommendationType",
    },
    {
      Header: "Details",
      accessor: "details",
    },
    {
      Header: "Status",
      accessor: "status",
    },
    {
      Header: "Submission Date",
      accessor: "submissionDate",
      Cell: ({ value }) => {
        const date = new Date(value);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, "0")}:${String(date.getDate()).padStart(2, "0")}:${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
        return formattedDate;
      },
    },
    {
      Header: "Last Modified Date",
      accessor: "lastModifiedDate",
      Cell: ({ value }) => {
        const date = new Date(value);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, "0")}:${String(date.getDate()).padStart(2, "0")}:${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
        return formattedDate;
      },
    },
    {
      Header: "Completion Date",
      accessor: "completionDate",
      Cell: ({ value }) => {
        if (!value) return ""; // Check if value exists
        const date = new Date(value);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, "0")}:${String(date.getDate()).padStart(2, "0")}:${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
        return formattedDate;
      },
    },
    {
      Header: "Due Date",
      accessor: "dueDate",
      Cell: ({ value }) => {
        const date = new Date(value);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, "0")}:${String(date.getDate()).padStart(2, "0")}:${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
        return formattedDate;
      },
    },
  ];

  //since all admins have the role of a user, we can just check if the current user has the role ROLE_USER
  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn(
        "Delete",
        "danger",
        deleteCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  if (
    hasRole(currentUser, "ROLE_USER") &&
    !hasRole(currentUser, "ROLE_ADMIN")
  ) {
    columns.push(
      ButtonColumn(
        "Edit",
        "primary",
        editCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  return (
    <OurTable
      data={requests}
      columns={columns}
      testid={"RecommendationRequestTable"}
    />
  );
}
