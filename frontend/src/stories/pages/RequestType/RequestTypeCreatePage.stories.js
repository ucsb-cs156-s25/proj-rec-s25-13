import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RequestTypeCreatePage from "main/pages/RequestType/RequestTypeCreatePage";

export default {
  title: "pages/RequestType/RequestTypeCreatePage",
  component: RequestTypeCreatePage,
};

const Template = () => <RequestTypeCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.professorUser, { status: 200 }),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 }),
    ),
    http.post("/api/requesttypes/post", ({ request }) => {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      const requestType = url.searchParams.get("requestType");

      return HttpResponse.json(
        {
          id,
          requestType,
        },
        { status: 200 },
      );
    }),
  ],
};
