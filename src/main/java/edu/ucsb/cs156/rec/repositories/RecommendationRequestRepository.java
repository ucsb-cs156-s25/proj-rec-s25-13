package edu.ucsb.cs156.rec.repositories;

import edu.ucsb.cs156.rec.entities.RecommendationRequest;
import edu.ucsb.cs156.rec.entities.User;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The RecommendationRequestRepository is a repository for RecommendationRequest entities.
 */

@Repository
public interface RecommendationRequestRepository extends CrudRepository<RecommendationRequest, Long> {
  Optional<RecommendationRequest> findByIdAndRequester(long id, User requester_id);
 /**
   * This method returns an iterable of recommendation requests with given requester_id.
   * @param requester_id requester_id within RecommendationRequest that maps to id in User table
   * @return iterable of RecommendationRequests with requester_id == requester_id
   */
  Iterable<RecommendationRequest> findAllByRequesterId(Long requester_id);

  /**
   * This method returns an iterable of recommendation requests with given professor_id.
   * @param professor_id professor_id within RecommendationRequest that maps to id in User table
   * @return iterable of RecommendationRequests with professor_id == professor_id
   */
  Iterable<RecommendationRequest> findAllByProfessorId(Long professor_id);

  /**
   * This method returns an iterable of recommendation requests with given professor_id.
   * @param id id of the RecommendationRequest
   * @param professor_id professor (User object)
   * @return instance of RecommendationRequest with id == id, professor_id == professor_id
   */
  Optional<RecommendationRequest> findByIdAndProfessor(long id, User professor_id);

  /**
   * Find all recommendation requests by professor ID and status.
   *
   * @param professor_id professor_id within RecommendationRequest that maps to id in User table
   * @param status the status of recommendation request
   * @return a list of recommendation requests matching the criteria
   */
  Iterable<RecommendationRequest> findAllByProfessorIdAndStatus(Long professor_id, String status);

}