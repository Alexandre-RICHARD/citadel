import type { DeleteProjectData } from "@citadel/specs/src/projects/auth/endpoint/me/deleteProjectData/deleteProjectDataEndpoint.interface";
import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../../../backlog/api/backlogQueryKeys";
import { gameDeathCounterQueryKeys } from "../../../gameDeathCounter/api/gameDeathCounterQueryKeys";

type Variables = {
	projects: readonly UserDataProjectEnum[];
	password: string;
};

// Le cache de chaque projet : ses données supprimées n'y restent pas
const PROJECT_QUERY_KEYS: Record<UserDataProjectEnum, readonly string[]> = {
	[UserDataProjectEnum.GAME_DEATH_COUNTER]: gameDeathCounterQueryKeys.all(),
	[UserDataProjectEnum.BACKLOG]: backlogQueryKeys.all(),
};

/**
 * Supprime toutes les données du compte dans ces projets, un projet après l'autre, avec le même mot de passe. Le compte
 * reste. Un mot de passe refusé arrête tout dès le premier projet
 */
export function useDeleteProjectData() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ projects, password }: Variables): Promise<void> => {
			for (const project of projects)
				// eslint-disable-next-line no-await-in-loop -- un mot de passe refusé arrête la suite
				await fetchHandler<DeleteProjectData>({
					url: `${ApiPrefixEnum.AUTH}/me/projects/:project`,
					method: HttpMethodEnum.DELETE,
					protected: true,
					pathParams: { project },
					body: { password },
				});
		},
		// Aussi après un échec : le premier projet a pu partir avant le refus du second
		onSettled: (_data, _error, { projects }) => {
			for (const project of projects)
				queryClient.removeQueries({ queryKey: PROJECT_QUERY_KEYS[project] });
		},
	});
}
