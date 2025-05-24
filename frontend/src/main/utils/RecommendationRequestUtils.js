import { toast } from "react-toastify";
import { hasRole } from "main/utils/currentUser";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell, currentUser) {
  const { requester, professor, id } = cell.row.original;

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    return {
      url: "/api/recommendationrequest/admin",
      method: "DELETE",
      params: { id },
    };
  } else if (requester.id === currentUser.root.user.id) {
    return {
      url: "/api/recommendationrequest",
      method: "DELETE",
      params: { id },
    };
  } else if (professor.id === currentUser.root.user.id) {
    return {
      url: "/api/recommendationrequest/professor",
      method: "DELETE",
      params: { id },
    };
  } else {
    throw new Error("Not authorized to delete this request");
  }
}

export function onUpdateStatusSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsUpdateStatus(cell, newStatus) {
  return {
    url: "/api/recommendationrequest/professor",
    method: "PUT",
    params: {
      id: cell.row.values.id,
    },
    data: {
      status: newStatus,
    },
  };
}
