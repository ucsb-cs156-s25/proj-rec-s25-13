import React from "react";
import OurTable, {
  ButtonColumn,
  ButtonDropdownColumn,
} from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
  formattedDate,
  cellToAxiosParamsUpdateStatus,
  onUpdateStatusSuccess,
} from "main/utils/RecommendationRequestUtils";

import { useNavigate, useLocation } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function RecommendationRequestTable({ requests, currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isPendingPage = location.pathname.includes("pending");
  const isCompletedPage = location.pathname.includes("completed");

  const editCallback = (cell) => {
    navigate(`/requests/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  // when delete success, invalidate the correct query key (depending on user role)

  const apiEndpoint =
    isPendingPage || isCompletedPage
      ? "/api/recommendationrequest/professor/all"
      : "/api/recommendationrequest/requester/all";

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    [apiEndpoint],
  );

  // Stryker restore all

  const updateStatusMutation = useBackendMutation(
    ({ cell, newStatus }) => cellToAxiosParamsUpdateStatus(cell, newStatus),
    { onSuccess: onUpdateStatusSuccess },
    [apiEndpoint],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const acceptCallback = async (cell) => {
    updateStatusMutation.mutate(
      { cell, newStatus: "IN PROGRESS" },
      {
        onSuccess: () =>
          onUpdateStatusSuccess("Request marked as IN PROGRESS."),
      },
    );
  };

  const denyCallback = async (cell) => {
    updateStatusMutation.mutate(
      { cell, newStatus: "DENIED" },
      {
        onSuccess: () => onUpdateStatusSuccess("Request marked as DENIED."),
      },
    );
  };

  const completeCallback = async (cell) => {
    updateStatusMutation.mutate(
      { cell, newStatus: "COMPLETED" },
      {
        onSuccess: () => onUpdateStatusSuccess("Request marked as COMPLETED."),
      },
    );
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
        return formattedDate(value);
      },
    },
    {
      Header: "Last Modified Date",
      accessor: "lastModifiedDate",
      Cell: ({ value }) => {
        return formattedDate(value);
      },
    },
    {
      Header: "Completion Date",
      accessor: "completionDate",
      Cell: ({ value }) => {
        if (!value) return ""; // Check if value exists
        return formattedDate(value);
      },
    },
    {
      Header: "Due Date",
      accessor: "dueDate",
      Cell: ({ value }) => {
        return formattedDate(value);
      },
    },
  ];

  if (hasRole(currentUser, "ROLE_PROFESSOR") && isPendingPage) {
    columns.push(
      ButtonDropdownColumn(
        "Update",
        "info",
        {
          Accept: acceptCallback,
          Deny: denyCallback,
          Complete: completeCallback,
        },
        "RecommendationRequestTable",
      ),
    );
  }

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
    !hasRole(currentUser, "ROLE_ADMIN") &&
    !isPendingPage &&
    !isCompletedPage
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
