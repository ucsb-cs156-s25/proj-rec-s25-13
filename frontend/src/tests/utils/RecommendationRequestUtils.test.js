import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/RecommendationRequestUtils";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { hasRole } from "main/utils/currentUser";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock("main/utils/currentUser", () => ({
  hasRole: jest.fn(),
}));
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("RecommendationRequestUtils", () => {
  describe("onDeleteSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
      // arrange
      const restoreConsole = mockConsole();

      // act
      onDeleteSuccess("abc");
      // asserts
      expect(mockToast).toHaveBeenCalledWith("abc");
      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toMatch("abc");

      restoreConsole();
    });
  });
  describe("cellToAxiosParamsDelete", () => {
    const cell = {
      row: {
        original: {
          id: 17,
          requester: { id: 2 },
          professor: { id: 3 },
        },
      },
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    test("Admins get the /admin delete", () => {
      hasRole.mockReturnValueOnce(true);

      const currentUser = currentUserFixtures.adminUser;

      const result = cellToAxiosParamsDelete(cell, currentUser);

      expect(hasRole).toHaveBeenCalledWith(currentUser, "ROLE_ADMIN");

      expect(result).toEqual({
        url: "/api/recommendationrequest/admin",
        method: "DELETE",
        params: { id: 17 },
      });
    });

    test("Requesters get regular URL delete", () => {
      hasRole.mockReturnValueOnce(false);

      const currentUser = currentUserFixtures.userOnly;

      const result = cellToAxiosParamsDelete(cell, currentUser);

      expect(result).toEqual({
        url: "/api/recommendationrequest",
        method: "DELETE",
        params: { id: 17 },
      });
    });

    test("Professors get /professor delete", () => {
      hasRole.mockReturnValueOnce(false);

      const currentUser = currentUserFixtures.professorUser;

      const result = cellToAxiosParamsDelete(cell, currentUser);

      expect(result).toEqual({
        url: "/api/recommendationrequest/professor",
        method: "DELETE",
        params: { id: 17 },
      });
    });

    test("Others get authorization error", () => {
      hasRole.mockReturnValueOnce(false);

      const currentUser = currentUserFixtures.adminUser;

      expect(() => cellToAxiosParamsDelete(cell, currentUser)).toThrow(
        "Not authorized to delete this request",
      );
    });
  });
});
