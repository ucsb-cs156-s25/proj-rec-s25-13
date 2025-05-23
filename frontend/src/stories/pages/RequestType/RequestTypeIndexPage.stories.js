import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { requestFixtures } from "fixtures/requestFixtures";
import { http, HttpResponse } from "msw";

import RequestTypeIndexPage from "main/pages/RequestType/RequestTypeIndexPage";

export default {
  title: "pages/RequestType/RequestTypeIndexPage",
  component: RequestTypeIndexPage,
};

const Template = () => <RequestTypeIndexPage storybook={true} />;

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 }),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 }),
    ),
    http.get("/api/requesttypes/all", () =>
      HttpResponse.json([], { status: 200 }),
    ),
  ],
};

export const FourTypesOrdinaryUser = Template.bind({});
FourTypesOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.get("/api/requesttypes/all", () =>
      HttpResponse.json(requestFixtures.fourTypes),
    ),
  ],
};

export const FourTypesAdminUser = Template.bind({});
FourTypesAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.adminUser),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.get("/api/requesttypes/all", () =>
      HttpResponse.json(requestFixtures.fourTypes),
    ),
    http.delete("/api/requesttypes", () =>
      HttpResponse.json({}, { status: 200 }),
    ),
  ],
};

export const FourTypesProfessorUser = Template.bind({});
FourTypesProfessorUser.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.professorUser),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.get("/api/requesttypes/all", () =>
      HttpResponse.json(requestFixtures.fourTypes),
    ),
    http.delete("/api/requesttypes", () =>
      HttpResponse.json({}, { status: 200 }),
    ),
  ],
};
