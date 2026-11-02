import { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum.ts";
import { describe, expect, it } from "vitest";

import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { selectEnumColumnValues } from "../../../../testUtils/integration/selectEnumColumnValues.ts";
import { User } from "../../models/User.ts";

describe("userModel", () => {
	describe("columns", () => {
		it("SHOULD write every column and read it back WHEN every attribute is given", async () => {
			// Arrange
			const word = buildUniqueWord();
			const attributes = {
				email: `${word}@example.com`,
				username: word,
				displayName: "Alex à la plage",
				passwordHash: "argon2id:m=19456,t=2,p=1:c2Vs:aGFzaA",
				passwordChangedAt: new Date("2026-11-01T10:00:00.001Z"),
				loginMethods: LoginMethodEnum.MAIL,
				lastLoginAt: new Date("2026-11-02T10:00:00.002Z"),
				lastSeenAt: new Date("2026-11-02T10:05:00.003Z"),
			};

			// Act
			const { id } = await User.create(attributes);
			const user = await User.findByPk(id);

			// Assert : base
			expect(await selectAuthRows.user(id)).toStrictEqual({
				id,
				...attributes,
			});

			// Assert : modèle
			expect(user?.get()).toStrictEqual({
				id,
				...attributes,
				createdAt: expect.any(Date) as Date,
				updatedAt: expect.any(Date) as Date,
			});
		});

		it("SHOULD allow both login methods and leave the optional attributes empty WHEN they are not given", async () => {
			// Arrange
			const word = buildUniqueWord();

			// Act
			const { id } = await User.create({
				email: `${word}@example.com`,
				username: word,
				passwordHash: "argon2id:m=19456,t=2,p=1:c2Vs:aGFzaA",
				passwordChangedAt: new Date(),
			});
			const user = await User.findByPk(id);

			// Assert
			expect(user?.loginMethods).toBe(LoginMethodEnum.BOTH);
			expect(user?.displayName).toBeNull();
			expect(user?.lastLoginAt).toBeNull();
			expect(user?.lastSeenAt).toBeNull();
		});
	});

	describe("schema", () => {
		it("SHOULD allow exactly the login methods of LoginMethodEnum WHEN the column is read", async () => {
			// Act
			const values = await selectEnumColumnValues("auth_user", "login_methods");

			// Assert
			expect(values).toStrictEqual(Object.values(LoginMethodEnum));
		});
	});
});
