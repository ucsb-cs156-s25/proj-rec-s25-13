import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestCreatePage from "main/pages/Requests/RecommendationRequestCreatePage";

import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

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
      return HttpResponse.json(
        recommendationRequestFixtures.oneRecommendationRequest,
        { status: 200 },
      );
    }),
  ],
};
