import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RequestTypeTable from "main/components/RequestType/RequestTypeTable";
import { Button } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/currentUser";

export default function RequestTypeIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: requestTypes,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/requesttypes/all"],
    { method: "GET", url: "/api/requesttypes/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    if (
      hasRole(currentUser, "ROLE_PROFESSOR") ||
      hasRole(currentUser, "ROLE_ADMIN")
    ) {
      return (
        <Button
          variant="primary"
          href="/requesttypes/post"
          style={{ float: "right" }}
        >
          Create RequestType
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>RequestType</h1>
        <RequestTypeTable
          requestTypes={requestTypes}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
