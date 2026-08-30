import type { TestDto } from "@citadel/specs/src/projects/test/dto/test.dto.ts";

import type { Test } from "../models/Test.ts";
import { toTestDtoMapper } from "./toTestDto.mapper.ts";

export function toTestsDtoMapper(entities: Test[]): TestDto[] {
	return entities.map(toTestDtoMapper);
}
