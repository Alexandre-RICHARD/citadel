import type { TestDto } from "@citadel/specs/src/projects/test/dto/testDto.type";
import { describe, expect, it } from "vitest";

import { fromTestDtoToTestFm } from "./fromTestDtoToTestFm";

// Forme réelle du JSON : les dates arrivent en chaînes, malgré le type Date de TestDto
function buildTestDto(updatedAt: string | null): TestDto {
	return {
		id: 3,
		name: "Hades",
		isActive: true,
		createdAt: "2026-10-01T08:00:00.000Z",
		updatedAt,
	} as unknown as TestDto;
}

describe("fromTestDtoToTestFm.ts", () => {
	describe("mapping", () => {
		it("SHOULD convert the dates received as text WHEN the test was updated", () => {
			expect(
				fromTestDtoToTestFm(buildTestDto("2026-10-02T09:30:00.000Z")),
			).toStrictEqual({
				id: 3,
				name: "Hades",
				isActive: true,
				createdAt: new Date("2026-10-01T08:00:00.000Z"),
				updatedAt: new Date("2026-10-02T09:30:00.000Z"),
			});
		});

		it("SHOULD keep updatedAt null WHEN the test was never updated", () => {
			expect(fromTestDtoToTestFm(buildTestDto(null)).updatedAt).toBeNull();
		});
	});
});
