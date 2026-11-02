import { randomBytes } from "node:crypto";

import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { describe, expect, it } from "vitest";

import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { selectEnumColumnValues } from "../../../../testUtils/integration/selectEnumColumnValues.ts";
import { Factor } from "../../models/Factor.ts";

describe("factorModel", () => {
	describe("columns", () => {
		it("SHOULD write every column and read it back WHEN every attribute of a TOTP factor is given", async () => {
			// Arrange
			const attributes = {
				userId: await insertAuthRows.user(),
				type: FactorTypeEnum.TOTP,
				name: "Téléphone",
				secretEncrypted: randomBytes(48),
				keyVersion: 2,
				lastUsedStep: 59_330_000,
				lastUsedAt: new Date("2026-11-02T10:00:00.001Z"),
				confirmedAt: new Date("2026-11-02T10:00:00.002Z"),
			};

			// Act
			const { id } = await Factor.create(attributes);
			const factor = await Factor.findByPk(id);

			// Assert : base
			expect(await selectAuthRows.factor(id)).toStrictEqual({
				id,
				...attributes,
			});

			// Assert : modèle
			expect(factor?.get()).toStrictEqual({
				id,
				...attributes,
				createdAt: expect.any(Date) as Date,
				updatedAt: expect.any(Date) as Date,
			});
		});

		it("SHOULD leave the secret, the key version, the usage and the confirmation empty WHEN an email factor is created", async () => {
			// Act
			const { id } = await Factor.create({
				userId: await insertAuthRows.user(),
				type: FactorTypeEnum.EMAIL,
				name: "Mail",
			});
			const factor = await Factor.findByPk(id);

			// Assert
			expect(factor?.get()).toMatchObject({
				secretEncrypted: null,
				keyVersion: null,
				lastUsedStep: null,
				lastUsedAt: null,
				confirmedAt: null,
			});
		});
	});

	describe("schema", () => {
		it("SHOULD allow exactly the types of FactorTypeEnum WHEN the column is read", async () => {
			// Act
			const values = await selectEnumColumnValues("auth_factor", "type");

			// Assert
			expect(values).toStrictEqual(Object.values(FactorTypeEnum));
		});
	});
});
