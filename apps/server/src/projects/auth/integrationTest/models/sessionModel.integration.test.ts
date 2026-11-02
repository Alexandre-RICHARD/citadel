import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { Session } from "../../models/Session.ts";

describe("sessionModel", () => {
	describe("columns", () => {
		it("SHOULD write every column and read it back WHEN every attribute is given", async () => {
			// Arrange
			const attributes = {
				userId: await insertAuthRows.user(),
				tokenHash: randomBytes(32),
				remember: true,
				userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/140.0",
				ip: "2001:db8:85a3::",
				lastSeenAt: new Date("2026-11-02T10:00:00.001Z"),
				expiresAt: new Date("2026-11-09T10:00:00.002Z"),
				absoluteExpiresAt: new Date("2026-12-02T10:00:00.003Z"),
			};

			// Act
			const { id } = await Session.create(attributes);
			const session = await Session.findByPk(id);

			// Assert : base, où un booléen est un TINYINT
			expect(await selectAuthRows.session(id)).toStrictEqual({
				id,
				...attributes,
				remember: 1,
			});

			// Assert : modèle
			expect(session?.get()).toStrictEqual({
				id,
				...attributes,
				createdAt: expect.any(Date) as Date,
				updatedAt: expect.any(Date) as Date,
			});
		});

		it("SHOULD read false and no user agent WHEN the session is not remembered and has no user agent", async () => {
			// Arrange
			const now = new Date();

			// Act
			const { id } = await Session.create({
				userId: await insertAuthRows.user(),
				tokenHash: randomBytes(32),
				remember: false,
				userAgent: null,
				ip: "203.0.113.0",
				lastSeenAt: now,
				expiresAt: now,
				absoluteExpiresAt: now,
			});
			const session = await Session.findByPk(id);

			// Assert
			expect(session?.remember).toBe(false);
			expect(session?.userAgent).toBeNull();
		});
	});

	describe("associations", () => {
		it("SHOULD include its account WHEN the session is read with its user", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const id = await insertAuthRows.session({ userId });

			// Act
			const session = await Session.findByPk(id, { include: ["user"] });

			// Assert
			expect(session?.user?.id).toBe(userId);
		});
	});
});
