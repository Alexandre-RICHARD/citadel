import type { ReorderSagaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/sagas/reorderSaga/reorderSagaBodyDto.type.ts";
import type { ReorderSagaPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/sagas/reorderSaga/reorderSagaPathParamDto.type.ts";

import type { ReorderSagaBean } from "../../../bean/reorderSagaBean.type.ts";

export function fromReorderSagaDtoToReorderSagaBean(
	pathParamDto: ReorderSagaPathParamDto,
	bodyDto: ReorderSagaBodyDto,
): ReorderSagaBean {
	return {
		sagaId: pathParamDto.sagaId,
		entries: bodyDto.entries.map(({ userMediaId, sagaNumber }) => ({
			userMediaId,
			sagaNumber,
		})),
	};
}
