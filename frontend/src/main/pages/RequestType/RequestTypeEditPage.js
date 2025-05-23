import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import RequestTypeForm from "main/components/RequestType/RequestTypeForm";
import { Navigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RequestTypeEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: requestTypes,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/requesttypes?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/requesttypes`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (requestTypes) => ({
    url: "/api/requesttypes",
    method: "PUT",
    params: {
      id: requestTypes.id,
    },
    data: {
      requestType: requestTypes.requestType,
    },
  });

  const onSuccess = (requestTypes) => {
    toast(
      `RequestType Updated - id: ${requestTypes.id} request type: ${requestTypes.requestType}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/requesttypes?id=${id}`],
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
        <h1>Edit RequestType</h1>
        {requestTypes && (
          <RequestTypeForm
            initialContents={requestTypes}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
