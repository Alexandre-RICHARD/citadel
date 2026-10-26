import { z } from "zod";

import { queryParamPageSchema } from "../../../../../specUtils/schemaValidator/number/queryParamPageSchema.ts";
import { BacklogColumnEnum } from "../../../enum/backlogColumn.enum.ts";
import { filterParamSchema } from "../../../schema/filterParamSchema.ts";
import { sortParamSchema } from "../../../schema/sortParamSchema.ts";

// Même écriture que l'URL de la page : `sort`, puis un paramètre par colonne filtrée, nommé par sa clé
export const getUserGamesQueryParamSchema = z.object({
	page: queryParamPageSchema("Page"),
	sort: sortParamSchema,
	[BacklogColumnEnum.NAME]: filterParamSchema(BacklogColumnEnum.NAME),
	[BacklogColumnEnum.SERIES]: filterParamSchema(BacklogColumnEnum.SERIES),
	[BacklogColumnEnum.SERIES_NUMBER]: filterParamSchema(
		BacklogColumnEnum.SERIES_NUMBER,
	),
	[BacklogColumnEnum.DEVELOPER]: filterParamSchema(BacklogColumnEnum.DEVELOPER),
	[BacklogColumnEnum.PUBLISHER]: filterParamSchema(BacklogColumnEnum.PUBLISHER),
	[BacklogColumnEnum.RELEASE_DATE]: filterParamSchema(
		BacklogColumnEnum.RELEASE_DATE,
	),
	[BacklogColumnEnum.ENDING_TYPE]: filterParamSchema(
		BacklogColumnEnum.ENDING_TYPE,
	),
	[BacklogColumnEnum.PLATFORM]: filterParamSchema(BacklogColumnEnum.PLATFORM),
	[BacklogColumnEnum.STATUS]: filterParamSchema(BacklogColumnEnum.STATUS),
	[BacklogColumnEnum.UP_NEXT]: filterParamSchema(BacklogColumnEnum.UP_NEXT),
	[BacklogColumnEnum.OWNED]: filterParamSchema(BacklogColumnEnum.OWNED),
	[BacklogColumnEnum.FINISH_DATE]: filterParamSchema(
		BacklogColumnEnum.FINISH_DATE,
	),
	[BacklogColumnEnum.FINISH_COUNT]: filterParamSchema(
		BacklogColumnEnum.FINISH_COUNT,
	),
	[BacklogColumnEnum.DLC]: filterParamSchema(BacklogColumnEnum.DLC),
	[BacklogColumnEnum.TRACKED_PLAY_TIME]: filterParamSchema(
		BacklogColumnEnum.TRACKED_PLAY_TIME,
	),
	[BacklogColumnEnum.ESTIMATED_PLAY_TIME]: filterParamSchema(
		BacklogColumnEnum.ESTIMATED_PLAY_TIME,
	),
	[BacklogColumnEnum.TOTAL_PLAY_TIME]: filterParamSchema(
		BacklogColumnEnum.TOTAL_PLAY_TIME,
	),
	[BacklogColumnEnum.RATING]: filterParamSchema(BacklogColumnEnum.RATING),
	[BacklogColumnEnum.COMMENT]: filterParamSchema(BacklogColumnEnum.COMMENT),
});
