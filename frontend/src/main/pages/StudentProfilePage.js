import { Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { useBackend } from "main/utils/useBackend";

const StudentProfilePage = () => {
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();

  // Fetch only the current user's recommendation requests
  const { data: requests } = useBackend(
    ["/api/recommendationrequest/requester/all"],
    { method: "GET", url: "/api/recommendationrequest/requester/all" },
    [],
  );

  if (!currentUser.loggedIn) {
    return <p>Not logged in.</p>;
  }

  const { email, pictureUrl, fullName } = currentUser.root.user;

  const handleEdit = (request) => {
    navigate(`/requests/edit/${request.id}`);
  };

  return (
    <BasicLayout>
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={pictureUrl}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md>
          <h2>{fullName}</h2>
          <p className="lead text-muted">{email}</p>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Button
            variant="primary"
            onClick={() => navigate("/requests/create")}
          >
            Create New Request
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <RecommendationRequestTable
            requests={requests}
            currentUser={currentUser}
            onEdit={handleEdit}
          />
        </Col>
      </Row>
    </BasicLayout>
  );
};

export default StudentProfilePage;
