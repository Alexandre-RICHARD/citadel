import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";

import type { UserMediaBean } from "../../bean/userMediaBean.type.ts";
import { matchesColumnFilter } from "../common/matchesColumnFilter.ts";
import { getMediaColumnValue } from "./getMediaColumnValue.ts";

// Textes cherchés par un filtre « contient » : le titre français et le titre original pour la colonne Titre
function getColumnTexts(
	column: MediaColumnEnum,
	userMedia: UserMediaBean,
): string[] {
	const texts =
		column === MediaColumnEnum.TITLE
			? [userMedia.title, userMedia.originalTitle]
			: [getMediaColumnValue(column, userMedia)];
	return texts.filter((text) => typeof text === "string");
}

function matchesFilter(
	userMedia: UserMediaBean,
	filter: ColumnFilter<MediaColumnEnum>,
): boolean {
	return matchesColumnFilter(
		filter,
		getMediaColumnValue(filter.column, userMedia),
		getColumnTexts(filter.column, userMedia),
	);
}

/**
 * Un film ou une série reste affiché s'il correspond à tous les filtres (et), ou à au moins un (ou). Les filtres ne lisent
 * que la ligne du média : une série passe sur ce qu'affiche sa ligne (sa progression), pas sur ses épisodes
 */
export function filterUserMediaBeans(
	userMediaList: UserMediaBean[],
	filters: ColumnFilter<MediaColumnEnum>[],
	filterMode: FilterModeEnum,
): UserMediaBean[] {
	if (filters.length === 0) return userMediaList;

	return userMediaList.filter((userMedia) =>
		filterMode === FilterModeEnum.AND
			? filters.every((filter) => matchesFilter(userMedia, filter))
			: filters.some((filter) => matchesFilter(userMedia, filter)),
	);
}
