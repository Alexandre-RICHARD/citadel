import type { GetAllSagas } from "@citadel/specs/src/projects/backlog/endpoint/sagas/getAllSagas/getAllSagasEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import type { SagaFm } from "../model/media/sagaFm.type";

const NO_SAGA: SagaFm[] = [];

// Les sagas du compte, par nom, proposées à l'ajout et par « Personnaliser » ; vide tant qu'elles ne sont pas lues
export function useAllSagas(): SagaFm[] {
	return (
		useQuery({
			queryKey: backlogQueryKeys.sagas(),
			queryFn: async ({ signal }) =>
				(
					await fetchHandler<GetAllSagas>(
						{
							url: `${ApiPrefixEnum.BACKLOG}/sagas`,
							method: HttpMethodEnum.GET,
							protected: true,
						},
						{ signal },
					)
				).data,
			select: (data): SagaFm[] => data ?? NO_SAGA,
		}).data ?? NO_SAGA
	);
}
