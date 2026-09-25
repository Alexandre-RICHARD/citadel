import { expect, test } from "vitest";

import { jwtDecoder } from "../../helpers/jwtDecoder.helper";
import { jwtGenerator } from "../../helpers/jwtGenerator.helper";
import { RoleEnum } from "../../v1/enum/role.enum";
import type { JWTCreate } from "../../v1/types/jwtCreate.type";

test("JWT encode/decode well", () => {
  const userData: JWTCreate = {
    userId: 1,
    fullname: "John Doe",
    role: RoleEnum.commercial,
    email: "johnDoe@gmail.com",
  };

  const newJWT = jwtGenerator(userData);
  expect(typeof newJWT).toBe("string");
  const decodedToken = jwtDecoder(newJWT);
  expect(decodedToken?.userId).toBe(userData.userId);
  expect(decodedToken?.fullname).toBe(userData.fullname);
  expect(decodedToken?.role).toBe(userData.role);
  expect(decodedToken?.email).toBe(userData.email);
});
