import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useCurrentUser } from "main/utils/currentUser";

export default function HomePage() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Welcome to RecManager</h1>
        <p>
          RecManager is a platform that helps manage recommendation requests
          between students and professors. Students can submit requests for
          recommendations, and professors can review, accept, or decline these
          requests. The system tracks request status, deadlines, and provides
          statistics on recommendation activities.
        </p>
        {currentUser?.loggedIn ? (
          <p>
            Use the navigation bar above to access pending requests, completed
            requests, and view recommendation statistics.
          </p>
        ) : (
          <p>
            Please log in to start viewing and managing recommendation requests.
          </p>
        )}
      </div>
    </BasicLayout>
  );
}
