import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";

export default function RequestTypeCreatePage({ storybook = false }) {
  const objectToAxiosParams = (requesttype) => ({
    url: "/api/requesttypes/post",
    method: "POST",
    params: {
      requesttype: requesttype.requesttype,
    },
  });

  const onSuccess = (requesttype) => {
    toast(
      `New request type created - id: ${requesttype.id} request type: ${requesttype.requesttype}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/requesttypes/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/requesttypes" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create new request type</h1>
        <RecommendationRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
