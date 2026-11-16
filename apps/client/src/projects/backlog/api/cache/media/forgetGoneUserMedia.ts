import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum";
import type { QueryClient } from "@tanstack/react-query";

import type { ApiError } from "../../../../../common/api/error/ApiError";
import { backlogQueryKeys } from "../../backlogQueryKeys";
import { removeCachedUserMedia } from "./removeCachedUserMedia";

/**
 * 404 métier : le média a quitté le backlog ailleurs (autre onglet). Sa ligne et ses saisons sont retirées au lieu d'annuler
 * la mise à jour optimiste
 */
export function forgetGoneUserMedia(
	queryClient: QueryClient,
	error: ApiError,
	userMediaId: number,
): void {
	if (error.code !== BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND) return;
	removeCachedUserMedia(queryClient, userMediaId);
	queryClient.removeQueries({
		queryKey: backlogQueryKeys.showSeasons(userMediaId),
	});
}
