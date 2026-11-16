import type { SagaEntryListDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaEntryListDto.type.ts";

import type { SagaEntryBean } from "../../../bean/sagaEntryBean.type.ts";

export function fromSagaEntryBeanListToSagaEntryListDto(
	entries: SagaEntryBean[],
): SagaEntryListDto {
	return { entries: entries.map((entry) => ({ ...entry })) };
}
