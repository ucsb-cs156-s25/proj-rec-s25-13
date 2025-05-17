package edu.ucsb.cs156.rec.controllers;

import edu.ucsb.cs156.rec.repositories.UserRepository;
import edu.ucsb.cs156.rec.testconfig.TestConfig;
import edu.ucsb.cs156.rec.ControllerTestCase;
import edu.ucsb.cs156.rec.entities.RecommendationRequest;
import edu.ucsb.cs156.rec.entities.RequestType;
import edu.ucsb.cs156.rec.entities.User;
import edu.ucsb.cs156.rec.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.rec.repositories.RequestTypeRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = RecommendationRequestController.class)
@Import(TestConfig.class)
public class RecommendationRequestTests extends ControllerTestCase {

        @MockBean
        RecommendationRequestRepository recommendationRequestRepository;

        @MockBean
        UserRepository userRepository;

        @MockBean
        RequestTypeRepository requestTypeRepository;

        // Authorization tests for /api/phones/admin/all

        @Test
        public void logged_out_users_cannot_get_all_requester() throws Exception {
                mockMvc.perform(get("/api/recommendationrequest/requester/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @Test
        public void logged_out_users_cannot_get_all_professor() throws Exception {
                mockMvc.perform(get("/api/recommendationrequest/professor/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_can_get_all_requester() throws Exception {
                mockMvc.perform(get("/api/recommendationrequest/requester/all"))
                                .andExpect(status().is(200)); // logged
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_cannot_get_all_professor() throws Exception {
                mockMvc.perform(get("/api/recommendationrequest/professor/all"))
                                .andExpect(status().is(403)); // not correct role
        }

        @WithMockUser(roles = { "USER", "PROFESSOR" })
        @Test
        public void logged_in_professors_can_get_all_professor() throws Exception {
                mockMvc.perform(get("/api/recommendationrequest/professor/all"))
                                .andExpect(status().is(200)); // correct role
        }

        @WithMockUser(roles = { "USER", "PROFESSOR" })
        @Test
        public void logged_in_professors_can_get_all_requester() throws Exception {
                mockMvc.perform(get("/api/recommendationrequest/requester/all"))
                                .andExpect(status().is(200)); // correct role
        }

        @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/recommendationrequest?id=7"))
                                .andExpect(status().is(403)); // logged out users can't get by id
        }

        // Authorization tests for /api/phones/post
        // (Perhaps should also have these for put and delete)

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/recommendationrequest/post"))
                                .andExpect(status().is(403));
        }

        // // Tests with mocks for database actions

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_exists_and_they_are_requester() throws Exception {

                // arrange
                User professor = User.builder().email("testemail@ucsb.edu").fullName("Test Prof").build();
                User currentUser = currentUserService.getCurrentUser().getUser();
                LocalDateTime now = LocalDateTime.now();
                RecommendationRequest recommendationRequest = RecommendationRequest.builder()
                                .professor(professor)
                                .requester(currentUser)
                                .recommendationType("PhD program")
                                .details("other details")
                                .dueDate(now)
                                .build();

                when(recommendationRequestRepository.findById(eq(7L))).thenReturn(Optional.of(recommendationRequest));  // Check not sure why id is 7

                // act
                MvcResult response = mockMvc.perform(get("/api/recommendationrequest?id=7"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findById(eq(7L));
                String expectedJson = mapper.writeValueAsString(recommendationRequest);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_exists_and_they_are_professor() throws Exception {

                // arrange
                User currentUser = currentUserService.getCurrentUser().getUser();
                User requester = User.builder().email("testemail@ucsb.edu").fullName("Test Prof").build();
                LocalDateTime now = LocalDateTime.now();
                RecommendationRequest recommendationRequest = RecommendationRequest.builder()
                                .professor(currentUser)
                                .requester(requester)
                                .recommendationType("PhD program")
                                .details("other details")
                                .dueDate(now)
                                .build();

                when(recommendationRequestRepository.findById(eq(7L))).thenReturn(Optional.of(recommendationRequest));  // Check not sure why id is 7

                // act
                MvcResult response = mockMvc.perform(get("/api/recommendationrequest?id=7"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findById(eq(7L));
                String expectedJson = mapper.writeValueAsString(recommendationRequest);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_cannot_get_by_id_when_the_id_exists_and_they_arent_professor_or_requester() throws Exception {

                // arrange
                User requester = User.builder().email("testemail@ucsb.edu").fullName("Test Prof").build();
                LocalDateTime now = LocalDateTime.now();
                RecommendationRequest recommendationRequest = RecommendationRequest.builder()
                                .professor(requester)
                                .requester(requester)
                                .recommendationType("PhD program")
                                .details("other details")
                                .dueDate(now)
                                .build();

                when(recommendationRequestRepository.findById(eq(7L))).thenReturn(Optional.of(recommendationRequest));  // Check not sure why id is 7

                MvcResult response = mockMvc.perform(get("/api/recommendationrequest?id=7"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findById(eq(7L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("RecommendationRequest with id 7 not found", json.get("message"));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

                // arrange
                when(recommendationRequestRepository.findById(eq(7L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(get("/api/recommendationrequest?id=7"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findById(eq(7L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("RecommendationRequest with id 7 not found", json.get("message"));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_get_all_recommendation_requests_by_them() throws Exception {

                // arrange

                User other = User.builder().email("testemail@ucsb.edu").fullName("Test User").build();
                User other2 = User.builder().email("testemail2@ucsb.edu").fullName("Test User2").build();
                User currentUser = currentUserService.getCurrentUser().getUser();
                LocalDateTime now = LocalDateTime.now();
                RecommendationRequest recommendationRequest1 = RecommendationRequest.builder()
                                .professor(other)
                                .requester(currentUser)
                                .recommendationType("PhD program")
                                .details("other details")
                                .dueDate(now)
                                .build();

                RecommendationRequest recommendationRequest2 = RecommendationRequest.builder()
                                .professor(other2)
                                .requester(currentUser)
                                .recommendationType("PhD program")
                                .details("other details")
                                .dueDate(now)
                                .build();

                ArrayList<RecommendationRequest> expectedRecommendationRequests = new ArrayList<>();
                expectedRecommendationRequests.addAll(Arrays.asList(recommendationRequest1, recommendationRequest2));

                when(recommendationRequestRepository.findAllByRequesterId(currentUser.getId())).thenReturn(expectedRecommendationRequests);

                // act
                MvcResult response = mockMvc.perform(get("/api/recommendationrequest/requester/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findAllByRequesterId(currentUser.getId());
                String expectedJson = mapper.writeValueAsString(expectedRecommendationRequests);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER", "PROFESSOR" })
        @Test
        public void logged_in_professors_can_get_all_recommendation_requests_for_them() throws Exception {

                // arrange

                User other = User.builder().id(1L).email("testemail@ucsb.edu").fullName("Test User").build();
                User other2 = User.builder().id(2L).email("testemail2@ucsb.edu").fullName("Test User2").build();
                User currentUser = currentUserService.getCurrentUser().getUser();
                LocalDateTime now = LocalDateTime.now();
                RecommendationRequest recommendationRequest1 = RecommendationRequest.builder()
                                .professor(currentUser)
                                .requester(other)
                                .recommendationType("PhD program")
                                .details("other details")
                                .dueDate(now)
                                .build();

                RecommendationRequest recommendationRequest2 = RecommendationRequest.builder()
                                .professor(currentUser)
                                .requester(other2)
                                .recommendationType("PhD program")
                                .details("other details")
                                .dueDate(now)
                                .build();

                ArrayList<RecommendationRequest> expectedRecommendationRequests = new ArrayList<>();
                expectedRecommendationRequests.addAll(Arrays.asList(recommendationRequest1, recommendationRequest2));

                when(recommendationRequestRepository.findAllByProfessorId(currentUser.getId())).thenReturn(expectedRecommendationRequests);

                // act
                MvcResult response = mockMvc.perform(get("/api/recommendationrequest/professor/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findAllByProfessorId(currentUser.getId());
                String expectedJson = mapper.writeValueAsString(expectedRecommendationRequests);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void a_user_can_post_a_new_recommendation_request_with_existing_professor() throws Exception {
                // arrange
                User u = currentUserService.getCurrentUser().getUser();
                User other = User.builder().id(7L).email("testemail@ucsb.edu").fullName("Test User").build();
                RecommendationRequest recommendationRequest1 = RecommendationRequest.builder()
                                .professor(other)
                                .requester(u)
                                .recommendationType("Other")
                                .details("otherdetails")
                                .dueDate(LocalDateTime.parse("2024-11-25T16:46:28"))
                                .status("PENDING")
                                .build();

                when(recommendationRequestRepository.save(eq(recommendationRequest1))).thenReturn(recommendationRequest1);
                when(userRepository.findById(7L)).thenReturn(Optional.of(other));
                // act
                MvcResult response = mockMvc.perform(
                                post("/api/recommendationrequest/post")
                                .param("recommendationType", "Other")
                                .param("details", "otherdetails")
                                .param("professorId", "7")
                                .param("dueDate", "2024-11-25T16:46:28")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();
                // assert
                verify(recommendationRequestRepository, times(1)).save(eq(recommendationRequest1));
                String expectedJson = mapper.writeValueAsString(recommendationRequest1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void a_user_can_post_a_new_recommendation_request_without_existing_professor() throws Exception {
                // act
                RequestType r = RequestType.builder().requestType("PhD program").build();
                when(requestTypeRepository.findByRequestType("PhD program")).thenReturn(Optional.of(r));
                mockMvc.perform(
                                post("/api/recommendationrequest/post")
                                .param("recommendationType", "PhD program")
                                .param("details", "otherdetails")
                                .param("professorId", "7")
                                .param("dueDate", "2024-11-25T16:46:28")
                                .with(csrf()))
                                .andExpect(status().isNotFound())
                                .andExpect(result -> assertEquals("User with id 7 not found",
                                                                result.getResolvedException().getMessage()));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void rec_type_in_table_and_not_other() throws Exception {
                // arrange
                User u = currentUserService.getCurrentUser().getUser();
                User other = User.builder().id(7L).email("testemail@ucsb.edu").fullName("Test User").build();
                RecommendationRequest recommendationRequest1 = RecommendationRequest.builder()
                                .professor(other)
                                .requester(u)
                                .recommendationType("CS Department BS/MS program")
                                .details("test")
                                .dueDate(LocalDateTime.parse("2024-11-25T16:46:28"))
                                .status("PENDING")
                                .build();

                when(recommendationRequestRepository.save(eq(recommendationRequest1))).thenReturn(recommendationRequest1);
                when(userRepository.findById(7L)).thenReturn(Optional.of(other));
                RequestType r = RequestType.builder().requestType("CS Department BS/MS program").build();
                when(requestTypeRepository.findByRequestType("CS Department BS/MS program")).thenReturn(Optional.of(r));
                // act
                MvcResult response = mockMvc.perform(
                                post("/api/recommendationrequest/post")
                                .param("recommendationType", "CS Department BS/MS program")
                                .param("details", "test")
                                .param("professorId", "7")
                                .param("dueDate", "2024-11-25T16:46:28")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();
                // assert
                verify(recommendationRequestRepository, times(1)).save(eq(recommendationRequest1));
                String expectedJson = mapper.writeValueAsString(recommendationRequest1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void rec_type_not_table_and_not_other() throws Exception {
                // act
                when(requestTypeRepository.findByRequestType("Not correct")).thenReturn(Optional.empty());
                MvcResult response = mockMvc.perform(
                                post("/api/recommendationrequest/post")
                                .param("recommendationType", "CS Department BS/MS program")
                                .param("details", "otherdetails")
                                .param("professorId", "7")
                                .param("dueDate", "2024-11-25T16:46:28")
                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();
                // assert
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("RequestType with id CS Department BS/MS program not found", json.get("message"));

        }
        
        @Test
        @WithMockUser(roles = "PROFESSOR")
        public void test_professor_can_get_recommendation_request_by_type() throws Exception {
                // Arrange
                User mockProfessor = User.builder().id(1L).email("professor@ucsb.edu").build();
                RecommendationRequest mockRequest1 = RecommendationRequest.builder()
                        .id(101L).professor(mockProfessor).status("completed").details("Details 1").build();
                RecommendationRequest mockRequest2 = RecommendationRequest.builder()
                        .id(102L).professor(mockProfessor).status("completed").details("Details 2").build();

                List<RecommendationRequest> mockRequests = List.of(mockRequest1, mockRequest2);

                when(userRepository.findByEmail("professor@ucsb.edu")).thenReturn(Optional.of(mockProfessor));
                when(recommendationRequestRepository.findAllByProfessorIdAndStatus(1L, "completed")).thenReturn(mockRequests);

                // Act & Assert
                mockMvc.perform(get("/api/recommendationrequest/professor/filtered")
                        .param("status", "completed"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.length()").value(2))
                        .andExpect(jsonPath("$[0].id").value(101))
                        .andExpect(jsonPath("$[1].id").value(102));

                verify(recommendationRequestRepository, times(1)).findAllByProfessorIdAndStatus(1L, "completed");
        }

        @Test
        @WithMockUser(roles = { "PROFESSOR" })
        public void test_professor_get_recommendation_request_by_status_empty_list() throws Exception {
                // Arrange
                User mockProfessor = User.builder()
                        .id(1L)
                        .email("professor@ucsb.edu")
                        .build();

                List<RecommendationRequest> mockRequests = List.of();

                when(userRepository.findByEmail("professor@ucsb.edu")).thenReturn(java.util.Optional.of(mockProfessor));
                when(recommendationRequestRepository.findAllByProfessorIdAndStatus(1L, "completed"))
                        .thenReturn(mockRequests);

                // Act & Assert
                mockMvc.perform(get("/api/recommendationrequest/professor/filtered")
                        .param("status", "completed"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.length()").value(0));

                verify(recommendationRequestRepository, times(1)).findAllByProfessorIdAndStatus(1L, "completed");
        }

        @Test
        @WithMockUser(roles = { "USER" })
        public void test_non_professor_get_recommendation_request_by_status_access_denied() throws Exception {
                // Act & Assert
                mockMvc.perform(get("/api/recommendationrequest/professor/filtered")
                        .param("status", "completed"))
                        .andExpect(status().isForbidden());

                verify(recommendationRequestRepository, times(0)).findAllByProfessorIdAndStatus(anyLong(), anyString());
        }
}
