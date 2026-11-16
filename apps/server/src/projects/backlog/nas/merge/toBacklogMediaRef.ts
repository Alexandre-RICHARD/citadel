import { normalizeMediaTitle } from "@citadel/specs/src/projects/backlog/helper/nas/normalizeMediaTitle.ts";

import type { UserMediaBean } from "../../bean/userMediaBean.type.ts";
import type { BacklogMediaRef } from "./backlogMediaRef.type.ts";

// Un média du backlog, réduit à ce qui le relie au relevé : titre français et titre original, année de sortie
export function toBacklogMediaRef({
	mediaType,
	tmdbId,
	title,
	originalTitle,
	releaseDate,
}: Pick<
	UserMediaBean,
	"mediaType" | "tmdbId" | "title" | "originalTitle" | "releaseDate"
>): BacklogMediaRef {
	return {
		mediaType,
		tmdbId,
		normalizedTitles: [
			...new Set([title, originalTitle].map(normalizeMediaTitle)),
		],
		year: releaseDate === null ? null : Number(releaseDate.slice(0, 4)),
	};
}
