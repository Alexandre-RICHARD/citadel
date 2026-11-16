import type { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type.ts";

import type { UserMediaBean } from "../../bean/userMediaBean.type.ts";
import { compareBySort } from "../common/compareBySort.ts";
import { getMediaSortValue } from "./getMediaSortValue.ts";

// Tri multi-colonnes sur ce qu'affichent les lignes ; sans tri, le média ajouté ou modifié en dernier passe en premier
export function sortUserMediaBeans(
	userMediaList: UserMediaBean[],
	sort: SortCriterion<MediaColumnEnum>[],
): UserMediaBean[] {
	if (sort.length === 0)
		return userMediaList.toSorted(
			(first, second) =>
				second.updatedAt.getTime() - first.updatedAt.getTime() ||
				second.id - first.id,
		);
	return userMediaList.toSorted((first, second) =>
		compareBySort(sort, first, second, getMediaSortValue),
	);
}
