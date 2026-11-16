import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogPageSizeEnum } from "@citadel/specs/src/projects/backlog/helper/view/backlogPageSize.enum.ts";

import type { UserMediaBean } from "../bean/userMediaBean.type.ts";

type UserMediaPage<Row> = {
	userMedia: Row[];
	matchedCount: number;
	movieCount: number;
	showCount: number;
	originalLanguages: string[];
};

/**
 * Une page des lignes triées et filtrées, et ce que le résumé et les filtres lisent de tout le backlog : le même découpage
 * pour le mode classique et le mode connecté
 */
export function buildUserMediaPage<Row extends UserMediaBean>(
	userMediaList: Row[],
	sorted: Row[],
	page: number,
): UserMediaPage<Row> {
	const pageSize = Number(BacklogPageSizeEnum.USER_MEDIA);
	const movieCount = userMediaList.filter(
		({ mediaType }) => mediaType === MediaTypeEnum.MOVIE,
	).length;
	return {
		userMedia: sorted.slice((page - 1) * pageSize, page * pageSize),
		matchedCount: sorted.length,
		movieCount,
		showCount: userMediaList.length - movieCount,
		originalLanguages: [
			...new Set(
				userMediaList.flatMap(({ originalLanguage }) =>
					originalLanguage === null ? [] : [originalLanguage],
				),
			),
		].toSorted(),
	};
}
