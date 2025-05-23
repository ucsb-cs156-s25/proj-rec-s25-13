import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RequestTypeForm from "main/components/RequestType/RequestTypeForm";
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RequestTypeCreatePage({ storybook = false }) {
  const objectToAxiosParams = (requestTypes) => ({
    url: "/api/requesttypes/post",
    method: "POST",
    params: {
      id: requestTypes.id,
      requestType: requestTypes.requestType,
    },
  });

  const onSuccess = (requestTypes) => {
    toast(
      `New requestType Created - id: ${requestTypes.id} request type: ${requestTypes.requestType}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/requesttypes/all"],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/requesttypes/all" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New RequestType</h1>

        <RequestTypeForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
