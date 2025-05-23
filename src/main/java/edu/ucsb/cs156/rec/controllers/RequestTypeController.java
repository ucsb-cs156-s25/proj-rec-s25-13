package edu.ucsb.cs156.rec.controllers;

import edu.ucsb.cs156.rec.entities.RequestType;
import edu.ucsb.cs156.rec.errors.EntityNotFoundException;
import edu.ucsb.cs156.rec.repositories.RequestTypeRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * This is a REST controller for RequestType
 */

@Tag(name = "RequestType")
@RequestMapping("/api/requesttypes")
@RestController
@Slf4j
public class RequestTypeController extends ApiController {

    @Autowired
    RequestTypeRepository requestTypeRepository;


    /**
     * This method returns a list of all Request Types.
     * @return a list of all Request Types.
     */
    @Operation(summary = "List all request types")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<RequestType> allRequestTypes(
    ) {
        Iterable<RequestType> requestTypes = requestTypeRepository.findAll();
        return requestTypes;
    }

        /**
     * Get a single request type by id
     * 
     * @param id the id of the request type
     * @return a RequestTYpe
     */
    @Operation(summary= "Get a single request type")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public RequestType getById(
            @Parameter(name="id") @RequestParam Long id) {
        RequestType requestType = requestTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RequestType.class, id));

        return requestType;
    }

    /**
     * Create a new request type
     * 
     * @param requestType   the title of the request type
     * @return the saved requesttype
     */
    @Operation(summary= "Create a new request type")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PROFESSOR')")
    @PostMapping("/post")
    public RequestType postRequestType(
            @Parameter(name="requestType") @RequestParam String requestType)
            throws JsonProcessingException {

        log.info("requestType={}", requestType);

        // Check for duplicates
        Iterable<RequestType> existingRequestTypes = requestTypeRepository.findAll();
        for (RequestType existing : existingRequestTypes) {
            if (existing.getRequestType().equals(requestType)) {
                throw new IllegalArgumentException("Duplicate request type: " + requestType);
            }
        }

        // Create new request type
        RequestType requestTypeNew = new RequestType();
        requestTypeNew.setRequestType(requestType);

        RequestType savedRequestType = requestTypeRepository.save(requestTypeNew);

        return savedRequestType;
    }

    /**
     * Delete a UCSBDate
     * 
     * @param id the id of the request type to delete
     * @return a message indicating the date was deleted
     */
    @Operation(summary= "Delete a request type")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PROFESSOR')")
    @DeleteMapping("")
    public Object deleteRequestType(
            @Parameter(name="id") @RequestParam Long id) {
        RequestType requestType = requestTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RequestType.class, id));

        requestTypeRepository.delete(requestType);
        return genericMessage("Request type with id %s deleted".formatted(id));
    }

    /**
     * Update a single request type
     * 
     * @param id       id of the request to update
     * @param incoming the new request type
     * @return the updated request type object
     */
    @Operation(summary= "Update a single request type")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PROFESSOR')")
    @PutMapping("")
    public RequestType updateRequestType(
            @Parameter(name="id") @RequestParam Long id,
            @RequestBody @Valid RequestType incoming) {

        RequestType requestType = requestTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RequestType.class, id));


        // Check for duplicates
        Iterable<RequestType> existingRequestTypes = requestTypeRepository.findAll();
        for (RequestType existing : existingRequestTypes) {
            if (incoming.getRequestType().isEmpty()){
                throw new IllegalArgumentException("Request type cannot be empty");
            }
            if(existing.getId() == id){
                continue;
            }
            if (existing.getRequestType().equals(incoming.getRequestType())) {
                throw new IllegalArgumentException("Duplicate request type: " + incoming);
            }
        }

        // Update and save the request type
        requestType.setRequestType(incoming.getRequestType());
        requestTypeRepository.save(requestType);

        return requestType;
    }
}
