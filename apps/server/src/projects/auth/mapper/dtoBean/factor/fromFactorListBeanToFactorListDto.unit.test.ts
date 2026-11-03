import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { describe, expect, it } from "vitest";

import { fromFactorListBeanToFactorListDto } from "./fromFactorListBeanToFactorListDto.ts";

describe("fromFactorListBeanToFactorListDto.ts", () => {
	describe("dates", () => {
		it("SHOULD give ISO dates, and null WHEN a factor was never used", () => {
			expect(
				fromFactorListBeanToFactorListDto({
					factors: [
						{
							id: 4,
							type: FactorTypeEnum.TOTP,
							name: "Téléphone",
							createdAt: new Date("2026-11-03T10:00:00.000Z"),
							lastUsedAt: new Date("2026-11-03T11:30:00.000Z"),
						},
						{
							id: 5,
							type: FactorTypeEnum.EMAIL,
							name: "Code par email",
							createdAt: new Date("2026-11-03T12:00:00.000Z"),
							lastUsedAt: null,
						},
					],
					remainingRecoveryCodes: 9,
				}),
			).toStrictEqual({
				factors: [
					{
						id: 4,
						type: FactorTypeEnum.TOTP,
						name: "Téléphone",
						createdAt: "2026-11-03T10:00:00.000Z",
						lastUsedAt: "2026-11-03T11:30:00.000Z",
					},
					{
						id: 5,
						type: FactorTypeEnum.EMAIL,
						name: "Code par email",
						createdAt: "2026-11-03T12:00:00.000Z",
						lastUsedAt: null,
					},
				],
				remainingRecoveryCodes: 9,
			});
		});
	});
});
