import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";

// import { useCurrentUser } from "main/utils/useCurrentUser";
import { useBackend } from "main/utils/useBackend";
const AdminRequestsPage = () => {
  const {
    data: requests,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/requests"],
    { method: "GET", url: "/api/recommendationrequest/admin" },
    [],
  );

  return (
    <BasicLayout>
      <h2>Recommendation Requests</h2>
      <RecommendationRequestTable requests={requests} />
    </BasicLayout>
  );
};

export default AdminRequestsPage;
