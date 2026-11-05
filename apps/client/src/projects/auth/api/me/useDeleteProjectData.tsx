import type { DeleteProjectData } from "@citadel/specs/src/projects/auth/endpoint/me/deleteProjectData/deleteProjectDataEndpoint.interface";
import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../../../backlog/api/backlogQueryKeys";
import { gameDeathCounterQueryKeys } from "../../../gameDeathCounter/api/gameDeathCounterQueryKeys";

type Variables = DeleteProjectData["request"]["body"];

// Le cache de chaque projet : ses données supprimées n'y restent pas
const PROJECT_QUERY_KEYS: Record<UserDataProjectEnum, readonly string[]> = {
	[UserDataProjectEnum.GAME_DEATH_COUNTER]: gameDeathCounterQueryKeys.all(),
	[UserDataProjectEnum.BACKLOG]: backlogQueryKeys.all(),
};

/**
 * Supprime toutes les données du compte dans ces projets, en une requête : tous ou aucun. Le compte reste
 */
export function useDeleteProjectData() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: Variables): Promise<void> => {
			await fetchHandler<DeleteProjectData>({
				url: `${ApiPrefixEnum.AUTH}/me/projects`,
				method: HttpMethodEnum.DELETE,
				protected: true,
				body,
			});
		},
		onSuccess: (_data, { projects }) => {
			for (const project of projects)
				queryClient.removeQueries({ queryKey: PROJECT_QUERY_KEYS[project] });
		},
	});
}
