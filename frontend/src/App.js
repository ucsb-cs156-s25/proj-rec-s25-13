import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";
import StudentProfilePage from "main/pages/StudentProfilePage";
import AdminRequestsPage from "main/pages/AdminRequestsPage";

import PendingRequestsPage from "main/pages/Requests/PendingRequestsPage";
import CompletedRequestsPage from "main/pages/Requests/CompletedRequestsPage";
import StatisticsPage from "main/pages/Requests/StatisticsPage";
import RecommendationRequestCreatePage from "main/pages/Requests/RecommendationRequestCreatePage";
import RecommendationRequestEditPage from "main/pages/Requests/RecommendationRequestEditPage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route
          exact
          path="/profile"
          element={
            hasRole(currentUser, "ROLE_USER") ? (
              <StudentProfilePage />
            ) : (
              <ProfilePage />
            )
          }
        />
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route exact path="/admin/users" element={<AdminUsersPage />} />
            <Route
              exact
              path="/admin/requests"
              element={<AdminRequestsPage />}
            />
          </>
        )}
        {(hasRole(currentUser, "ROLE_PROFESSOR") ||
          hasRole(currentUser, "ROLE_USER")) && (
          <>
            <Route
              exact
              path="/requests/pending"
              element={<PendingRequestsPage />}
            />
            <Route
              exact
              path="/requests/completed"
              element={<CompletedRequestsPage />}
            />
            <Route
              exact
              path="/requests/statistics"
              element={<StatisticsPage />}
            />
            <Route
              exact
              path="/requests/create"
              element={<RecommendationRequestCreatePage />}
            />
            <Route
              exact
              path="/requests/edit/:id"
              element={<RecommendationRequestEditPage />}
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
