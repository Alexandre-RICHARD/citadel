import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fromShowSeasonListDtoToShowSeasonsFm } from "../model/media/fromShowSeasonListDtoToShowSeasonsFm";
import type { ShowSeasonFm } from "../model/media/showSeasonFm.type";
import { showSeasonsQueryOptions } from "./showSeasonsQueryOptions";

type ShowSeasons = {
	// undefined pendant la lecture
	seasons: ShowSeasonFm[] | undefined;
	error: ApiError | null;
};

/**
 * Dépliage d'une série : ses saisons et leurs épisodes, avec ceux qui sont vus ; ne se lit qu'une série dépliée. Sans
 * suspension : la lecture et son échec s'affichent dans les sous-lignes, le reste du tableau ne bouge pas
 */
export function useShowSeasons(
	userMediaId: number,
	isConnected: boolean,
): ShowSeasons {
	const seasons = useQuery({
		...showSeasonsQueryOptions(userMediaId, isConnected),
		select: (data) =>
			fromShowSeasonListDtoToShowSeasonsFm(data, getTodayIsoDate()),
	});
	return {
		seasons: seasons.data,
		error: seasons.error as ApiError | null,
	};
}
