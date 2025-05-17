import { Button, Form, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function RequestTypeForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
  requestTypeVals = [],
  professorVals = [],
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const [professors, setProfessors] = useState(professorVals);
  const [requestTypes, setRequestTypes] = useState(requestTypeVals);

  //queries endpoint to get list of professors
  useEffect(() => {
    const getProfessors = async () => {
      try {
        const response = await fetch("/api/admin/users/professors");
        const data = await response.json();
        setProfessors(data);
      } catch (error) {
        console.error("Error fetching professors");
      }
    };
    const getRequestTypes = async () => {
      try {
        const response = await fetch("/api/requesttypes/all");
        const data = await response.json();
        setRequestTypes(data);
      } catch (error) {
        console.error("Error fetching request types");
      }
    };

    getProfessors();
    getRequestTypes();
  });

  const navigate = useNavigate();

  // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  // Note that even this complex regex may still need some tweaks

  // Stryker disable Regex

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="RequestTypeForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="professor_id">Professor</Form.Label>
            <Form.Select
              data-testid="RequestTypeForm-professor_id"
              id="professor_id"
              type="string"
              isInvalid={Boolean(errors.professor_id)}
              {...register("professor_id", {
                required: "Please select a professor",
              })}
              defaultValue=""
            >
              {Array.isArray(professors) && professors.length > 0 ? (
                <>
                  <option disabled value="">
                    Select a professor
                  </option>
                  {professors.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.fullName}
                    </option>
                  ))}
                </>
              ) : (
                <option disabled value="">
                  No professors available
                </option>
              )}
            </Form.Select>
            {errors.professor_id && (
              <Form.Control.Feedback type="invalid">
                {errors.professor_id.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requestType">Request Type</Form.Label>
            <Form.Select
              data-testid="RequestTypeForm-requestType"
              id="requestType"
              type="string"
              isInvalid={Boolean(errors.requestType)}
              {...register("requestType", {
                required: "Please select a request type",
              })}
              defaultValue=""
            >
              {Array.isArray(requestTypes) && requestTypes.length > 0 ? (
                <>
                  <option disabled value="">
                    Select a request type
                  </option>
                  {requestTypes.map((requestType) => (
                    <option
                      key={requestType.id}
                      value={requestType.requestType}
                    >
                      {requestType.requestType}
                    </option>
                  ))}
                </>
              ) : (
                <option disabled value="">
                  No request types available, use Other in details
                </option>
              )}
              <option value="Other">Other</option>
            </Form.Select>
            {errors.requestType && (
              <Form.Control.Feedback type="invalid">
                {errors.requestType.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="details">Details</Form.Label>
            <Form.Control
              data-testid="RequestTypeForm-details"
              id="details"
              type="text"
              isInvalid={Boolean(errors.details)}
              {...register("details")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="RequestTypeForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="RequestTypeForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default RequestTypeForm;
