import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { RecoveryCode } from "../../models/RecoveryCode.ts";

describe("recoveryCodeModel", () => {
	describe("columns", () => {
		it("SHOULD write every column and read it back WHEN every attribute is given", async () => {
			// Arrange
			const attributes = {
				userId: await insertAuthRows.user(),
				codeHash: randomBytes(32),
				usedAt: new Date("2026-11-02T10:00:00.001Z"),
			};

			// Act
			const { id } = await RecoveryCode.create(attributes);
			const recoveryCode = await RecoveryCode.findByPk(id);

			// Assert : base
			expect(await selectAuthRows.recoveryCode(id)).toStrictEqual({
				id,
				...attributes,
			});

			// Assert : modèle
			expect(recoveryCode?.get()).toStrictEqual({
				id,
				...attributes,
				createdAt: expect.any(Date) as Date,
				updatedAt: expect.any(Date) as Date,
			});
		});

		it("SHOULD read the code as unused WHEN it is created without a use date", async () => {
			// Act
			const { id } = await RecoveryCode.create({
				userId: await insertAuthRows.user(),
				codeHash: randomBytes(32),
			});
			const recoveryCode = await RecoveryCode.findByPk(id);

			// Assert
			expect(recoveryCode?.usedAt).toBeNull();
		});
	});
});
