import type { GetSagaEntriesPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/sagas/getSagaEntries/getSagaEntriesPathParamDto.type.ts";

import type { GetSagaEntriesBean } from "../../../bean/getSagaEntriesBean.type.ts";

export function fromGetSagaEntriesDtoToGetSagaEntriesBean(
	pathParamDto: GetSagaEntriesPathParamDto,
): GetSagaEntriesBean {
	return { sagaId: pathParamDto.sagaId };
}
