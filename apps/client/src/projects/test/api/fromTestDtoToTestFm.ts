import type { TestDto } from "@citadel/specs/src/projects/test/dto/testDto.type";

import type { TestFm } from "./testFm.type";

// TestDto annonce des Date, mais le JSON les transporte en chaînes : la conversion se fait ici
export function fromTestDtoToTestFm(testDto: TestDto): TestFm {
	return {
		id: testDto.id,
		name: testDto.name,
		isActive: testDto.isActive,
		createdAt: new Date(testDto.createdAt),
		updatedAt: testDto.updatedAt === null ? null : new Date(testDto.updatedAt),
	};
}
