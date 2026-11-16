import type { GetShowUpdates } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/getShowUpdates/getShowUpdatesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import type { ShowUpdateFm } from "../model/media/showUpdateFm.type";

type ShowUpdates = {
	// undefined pendant la relecture sur TMDB ; vide sans nouveauté
	updates: ShowUpdateFm[] | undefined;
	error: ApiError | null;
};

/**
 * « Récupérer les nouveautés des séries » : le serveur relit sur TMDB les séries en cours du backlog, sans rien enregistrer.
 * Relu à chaque ouverture de la modale, jamais tout seul : le récapitulatif doit être celui du moment
 */
export function useShowUpdates(): ShowUpdates {
	const updates = useQuery({
		queryKey: backlogQueryKeys.showUpdates(),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetShowUpdates>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/show-updates`,
						method: HttpMethodEnum.GET,
						protected: true,
					},
					{ signal },
				)
			).data,
		gcTime: 0,
		staleTime: 0,
		refetchOnWindowFocus: false,
		select: (data): ShowUpdateFm[] => data ?? [],
	});
	return {
		updates: updates.data,
		error: updates.error as ApiError | null,
	};
}
