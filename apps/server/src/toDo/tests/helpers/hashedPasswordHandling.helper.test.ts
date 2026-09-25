import { expect, test } from "vitest";

import { bcryptEncoderHelper } from "../../helpers/bcryptEncoder.helper.ts";

test("Password correctly hashed", async () => {
  const password = "myIncrediblyStrongPassword1234";
  const hashedPassword = await bcryptEncoderHelper(password);
  expect(hashedPassword.startsWith("$2b$10$")).toBe(true);
  expect(hashedPassword.length).toBe(60);
  expect(hashedPassword !== password).toBe(true);
});
