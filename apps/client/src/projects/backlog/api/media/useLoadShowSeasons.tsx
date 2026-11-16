import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { fromShowSeasonListDtoToShowSeasonsFm } from "../model/media/fromShowSeasonListDtoToShowSeasonsFm";
import type { ShowSeasonFm } from "../model/media/showSeasonFm.type";
import { showSeasonsQueryOptions } from "./showSeasonsQueryOptions";

/**
 * Les saisons d'une série, lues à la demande (ou prises dans le cache) : la case « Vu » d'une série repliée en a besoin pour
 * savoir quels épisodes cocher
 */
export function useLoadShowSeasons(
	isConnected: boolean,
): (userMediaId: number) => Promise<ShowSeasonFm[]> {
	const queryClient = useQueryClient();
	return useCallback(
		async (userMediaId: number) =>
			fromShowSeasonListDtoToShowSeasonsFm(
				await queryClient.fetchQuery(
					showSeasonsQueryOptions(userMediaId, isConnected),
				),
				getTodayIsoDate(),
			),
		[queryClient, isConnected],
	);
}
