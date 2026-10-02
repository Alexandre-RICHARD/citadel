import type { TestDto } from "@citadel/specs/src/projects/test/dto/testDto.ts";

import type { Test } from "../models/Test.ts";
import { toTestDtoMapper } from "./toTestDtoMapper.ts";

export function toTestsDtoMapper(entities: Test[]): TestDto[] {
	return entities.map(toTestDtoMapper);
}
