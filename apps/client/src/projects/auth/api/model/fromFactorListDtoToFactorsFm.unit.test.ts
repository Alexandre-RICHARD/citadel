import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum";
import { describe, expect, it } from "vitest";

import { fromFactorListDtoToFactorsFm } from "./fromFactorListDtoToFactorsFm";

describe("fromFactorListDtoToFactorsFm.ts", () => {
	describe("factors", () => {
		it("SHOULD turn the ISO dates into browser times and keep the empty last use as null", () => {
			expect(
				fromFactorListDtoToFactorsFm({
					factors: [
						{
							id: 4,
							type: FactorTypeEnum.TOTP,
							name: "Mon téléphone",
							createdAt: "2026-11-03T10:00:00.000Z",
							lastUsedAt: null,
						},
						{
							id: 5,
							type: FactorTypeEnum.EMAIL,
							name: "Code par email",
							createdAt: "2026-11-03T10:00:00.000Z",
							lastUsedAt: "2026-11-04T08:30:00.000Z",
						},
					],
					remainingRecoveryCodes: 7,
				}),
			).toStrictEqual({
				factors: [
					{
						id: 4,
						type: FactorTypeEnum.TOTP,
						name: "Mon téléphone",
						createdAt: Date.UTC(2026, 10, 3, 10),
						lastUsedAt: null,
					},
					{
						id: 5,
						type: FactorTypeEnum.EMAIL,
						name: "Code par email",
						createdAt: Date.UTC(2026, 10, 3, 10),
						lastUsedAt: Date.UTC(2026, 10, 4, 8, 30),
					},
				],
				remainingRecoveryCodes: 7,
			});
		});
	});
});
