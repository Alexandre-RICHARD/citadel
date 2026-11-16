import type { SagaDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaDto.type";
import type { SagaListDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaListDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../../backlogQueryKeys";

// Les sagas du compte, si elles ont été lues ; une liste vide (204) n'en a aucune
export function getCachedSagas(queryClient: QueryClient): SagaDto[] {
	return (
		queryClient.getQueryData<SagaListDto | null>(backlogQueryKeys.sagas()) ?? []
	);
}
