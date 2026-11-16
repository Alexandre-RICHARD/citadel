import type { SagaListDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaListDto.type.ts";

import type { SagaBean } from "../../../bean/sagaBean.type.ts";

export function fromSagaBeanListToSagaListDto(sagas: SagaBean[]): SagaListDto {
	return sagas.map(({ id, name }) => ({ id, name }));
}
