import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestCreatePage from "main/pages/Requests/RecommendationRequestCreatePage";

import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import usersFixtures from "fixtures/usersFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";

export default {
  title: "pages/Requests/RecommendationRequestsCreatePage",
  component: RecommendationRequestCreatePage,
};

const Template = () => <RecommendationRequestCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/recommendationrequest/post", () => {
      return HttpResponse.json(recommendationRequestFixtures.oneCompleted, {
        status: 200,
      });
    }),
    http.get("/api/admin/users/professors", () => {
      return HttpResponse.json(usersFixtures.twoProfessors, {
        status: 200,
      });
    }),
    http.get("/api/requesttypes/all", () => {
      return HttpResponse.json(recommendationTypeFixtures.fourTypes, {
        status: 200,
      });
    }),
  ],
};
