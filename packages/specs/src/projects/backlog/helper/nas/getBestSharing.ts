import { NasSharingEnum } from "../../enum/nasSharing.enum.ts";

// Du meilleur au moins bon : l'ordre de l'enum
const SHARING_ORDER = Object.values(NasSharingEnum);

/**
 * Le meilleur état de partage parmi ceux de plusieurs torrents, ou de plusieurs épisodes (§4 : une saison prend le
 * meilleur état de ses épisodes). Aucun : « Non présent »
 */
export function getBestSharing(states: NasSharingEnum[]): NasSharingEnum {
	return states.reduce(
		(best, state) =>
			SHARING_ORDER.indexOf(state) < SHARING_ORDER.indexOf(best) ? state : best,
		NasSharingEnum.NONE,
	);
}
