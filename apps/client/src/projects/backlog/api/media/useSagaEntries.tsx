import type { GetSagaEntries } from "@citadel/specs/src/projects/backlog/endpoint/sagas/getSagaEntries/getSagaEntriesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromSagaEntryListDtoToSagaEntriesFm } from "../model/media/fromSagaEntryListDtoToSagaEntriesFm";
import type { SagaEntryFm } from "../model/media/sagaEntryFm.type";

type SagaEntries = {
	// null tant qu'ils ne sont pas chargés ; vide sans saga
	entries: SagaEntryFm[] | null;
	error: ApiError | null;
	// Lecture périmée (invalidée par une écriture), relue au prochain affichage
	isStale: boolean;
};

/**
 * Les médias du backlog d'une saga, par numéro. sagaId null : pas de saga, ou une saga pas encore créée, sans média à lire
 */
export function useSagaEntries(sagaId: number | null): SagaEntries {
	const hasSaga = sagaId !== null && sagaId > 0;
	const entries = useQuery({
		queryKey: backlogQueryKeys.sagaEntries(sagaId ?? 0),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetSagaEntries>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/sagas/:sagaId/entries`,
						method: HttpMethodEnum.GET,
						protected: true,
						pathParams: { sagaId: sagaId ?? 0 },
					},
					{ signal },
				)
			).data,
		enabled: hasSaga,
		select: fromSagaEntryListDtoToSagaEntriesFm,
	});
	if (!hasSaga) return { entries: [], error: null, isStale: false };
	return {
		entries: entries.data ?? null,
		error: entries.error as ApiError | null,
		isStale: entries.isStale,
	};
}
