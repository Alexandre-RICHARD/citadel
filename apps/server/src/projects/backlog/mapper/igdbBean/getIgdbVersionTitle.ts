import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";

import { IgdbGameTypeNameEnum } from "../../igdb/igdbGameTypeName.enum.ts";
import type { IgdbVersionGame } from "../../igdb/type/igdbVersionGame.type.ts";
import { getIgdbFirstReleaseTime } from "./getIgdbFirstReleaseTime.ts";

const SECOND_MS = 1000;

// Types IGDB des versions, en français ; une édition (« Main Game » ou « Bundle » rattachés par `version_parent`) n'y est pas
const versionTypeLabels: Partial<Record<string, string>> = {
	[IgdbGameTypeNameEnum.PORT]: "Portage",
	[IgdbGameTypeNameEnum.REMASTER]: "Remaster",
	[IgdbGameTypeNameEnum.EXPANDED_GAME]: "Version enrichie",
};
const EDITION_LABEL = "Édition";

/**
 * Titre d'une version autre que l'originale (cahier des charges, §5) : `version_title`, sinon son nom s'il diffère de celui
 * du jeu, sinon son type et l'année de sa première sortie, pour la distinguer de l'originale (« Portage 1998 », « Édition 2015 »)
 */
export function getIgdbVersionTitle(
	version: IgdbVersionGame,
	gameName: string,
): string {
	const versionTitle = trimToNull(version.version_title);
	if (versionTitle !== null) return versionTitle;
	if (version.name.trim() !== gameName.trim()) return version.name;

	const typeLabel =
		versionTypeLabels[version.game_type?.type ?? ""] ?? EDITION_LABEL;
	const firstReleaseTime = getIgdbFirstReleaseTime(version);
	return firstReleaseTime === Number.MAX_SAFE_INTEGER
		? typeLabel
		: `${typeLabel} ${new Date(firstReleaseTime * SECOND_MS).getUTCFullYear()}`;
}
