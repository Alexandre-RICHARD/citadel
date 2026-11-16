import { z } from "zod";

import { queryParamPageSchema } from "../../../../../specUtils/schemaValidator/number/queryParamPageSchema.ts";
import { BacklogColumnEnum } from "../../../enum/backlogColumn.enum.ts";
import { gameColumnFilterKinds } from "../../../helper/view/gameColumnFilterKinds.ts";
import { ViewParamSyntaxEnum } from "../../../helper/view/viewParamSyntax.enum.ts";
import { filterModeParamSchema } from "../../../schema/filterModeParamSchema.ts";
import { filterParamSchema } from "../../../schema/filterParamSchema.ts";
import { sortParamSchema } from "../../../schema/sortParamSchema.ts";

// Même écriture que l'URL de la page : `sort`, puis un paramètre par colonne filtrée, nommé par sa clé
export const getUserGamesQueryParamSchema = z.object({
	page: queryParamPageSchema("Page"),
	sort: sortParamSchema(gameColumnFilterKinds),
	[ViewParamSyntaxEnum.FILTER_MODE_PARAM]: filterModeParamSchema,
	[BacklogColumnEnum.NAME]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.NAME,
	),
	[BacklogColumnEnum.SERIES]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.SERIES,
	),
	[BacklogColumnEnum.SERIES_NUMBER]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.SERIES_NUMBER,
	),
	[BacklogColumnEnum.DEVELOPER]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.DEVELOPER,
	),
	[BacklogColumnEnum.PUBLISHER]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.PUBLISHER,
	),
	[BacklogColumnEnum.RELEASE_DATE]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.RELEASE_DATE,
	),
	[BacklogColumnEnum.ENDING_TYPE]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.ENDING_TYPE,
	),
	[BacklogColumnEnum.PLATFORM]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.PLATFORM,
	),
	[BacklogColumnEnum.STATUS]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.STATUS,
	),
	[BacklogColumnEnum.IN_PROGRESS]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.IN_PROGRESS,
	),
	[BacklogColumnEnum.UP_NEXT]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.UP_NEXT,
	),
	[BacklogColumnEnum.OWNED]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.OWNED,
	),
	[BacklogColumnEnum.FINISH_DATE]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.FINISH_DATE,
	),
	[BacklogColumnEnum.FINISH_COUNT]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.FINISH_COUNT,
	),
	[BacklogColumnEnum.DLC]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.DLC,
	),
	[BacklogColumnEnum.TRACKED_PLAY_TIME]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.TRACKED_PLAY_TIME,
	),
	[BacklogColumnEnum.ESTIMATED_PLAY_TIME]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.ESTIMATED_PLAY_TIME,
	),
	[BacklogColumnEnum.TOTAL_PLAY_TIME]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.TOTAL_PLAY_TIME,
	),
	[BacklogColumnEnum.RATING]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.RATING,
	),
	[BacklogColumnEnum.COMMENT]: filterParamSchema(
		gameColumnFilterKinds,
		BacklogColumnEnum.COMMENT,
	),
});
