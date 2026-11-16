import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../../backlogQueryKeys";
import type { UserMediaListData } from "./userMediaListData.type";

// La ligne d'un média dans une vue du tableau en cache ; null si aucune ne l'a chargée
export function findCachedUserMedia(
	queryClient: QueryClient,
	userMediaId: number,
): UserMediaDto | null {
	for (const [, data] of queryClient.getQueriesData<UserMediaListData>({
		queryKey: backlogQueryKeys.userMediaLists(),
	}))
		for (const page of data?.pages ?? []) {
			const userMedia = page?.userMedia.find(({ id }) => id === userMediaId);
			if (userMedia !== undefined) return userMedia;
		}
	return null;
}
