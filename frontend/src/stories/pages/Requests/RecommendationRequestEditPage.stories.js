import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestEditPage from "main/pages/Requests/RecommendationRequestEditPage";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import usersFixtures from "fixtures/usersFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";

export default {
  title: "pages/Requests/RecommendationRequestEditPage",
  component: RecommendationRequestEditPage,
};

const Template = () => <RecommendationRequestEditPage storybook={true} />;

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
    http.get("/api/recommendationrequest", () => {
      return HttpResponse.json(
        recommendationRequestFixtures.threeRecommendations[0],
        {
          status: 200,
        },
      );
    }),
    http.put("/api/recommendationrequest", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
    http.put("/api/recommendationrequest", (req) => {
      window.alert("PUT: " + req.url + " and body: " + req.body);
      return HttpResponse.json({}, { status: 200 });
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
