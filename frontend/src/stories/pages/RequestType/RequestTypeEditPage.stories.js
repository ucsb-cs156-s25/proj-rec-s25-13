import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { requestFixtures } from "fixtures/requestFixtures";
import { http, HttpResponse } from "msw";

import RequestTypeEditPage from "main/pages/RequestType/RequestTypeEditPage";

export default {
  title: "pages/RequestType/RequestTypeEditPage",
  component: RequestTypeEditPage,
};

const Template = () => <RequestTypeEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.professorUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/requesttypes", () => {
      return HttpResponse.json(requestFixtures.fourTypes[0], {
        status: 200,
      });
    }),
    http.put("/api/requesttypes", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
