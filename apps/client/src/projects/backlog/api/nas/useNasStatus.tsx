import { useQuery } from "@tanstack/react-query";

import { fromNasStatusDtoToNasStatusFm } from "../model/nas/fromNasStatusDtoToNasStatusFm";
import type { NasStatusFm } from "../model/nas/nasStatusFm.type";
import { nasStatusQueryOptions } from "./nasStatusQueryOptions";

const CLOSED: NasStatusFm = {
	isAvailable: false,
	isUnlocked: false,
	surveyedAt: null,
	jellyfin: null,
	consoleUrl: null,
};

/**
 * Le mode connecté, lu avant le tableau : il en choisit les colonnes et l'endpoint. undefined pendant la lecture ; un
 * échec laisse le backlog en mode classique, sans rien bloquer
 */
export function useNasStatus(): NasStatusFm | undefined {
	const status = useQuery({
		...nasStatusQueryOptions(),
		select: (dto) =>
			fromNasStatusDtoToNasStatusFm(dto, window.location.hostname),
	});
	return status.isError ? CLOSED : status.data;
}
