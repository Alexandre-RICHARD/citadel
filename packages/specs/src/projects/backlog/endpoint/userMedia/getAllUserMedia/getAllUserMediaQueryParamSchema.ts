import { z } from "zod";

import { queryParamPageSchema } from "../../../../../specUtils/schemaValidator/number/queryParamPageSchema.ts";
import { MediaColumnEnum } from "../../../enum/mediaColumn.enum.ts";
import { mediaColumnFilterKinds } from "../../../helper/view/mediaColumnFilterKinds.ts";
import { ViewParamSyntaxEnum } from "../../../helper/view/viewParamSyntax.enum.ts";
import { filterModeParamSchema } from "../../../schema/filterModeParamSchema.ts";
import { filterParamSchema } from "../../../schema/filterParamSchema.ts";
import { sortParamSchema } from "../../../schema/sortParamSchema.ts";

function mediaFilterParamSchema(column: MediaColumnEnum) {
	return filterParamSchema(mediaColumnFilterKinds, column);
}

// Même écriture que l'URL de la page : `sort`, puis un paramètre par colonne filtrée, nommé par sa clé
export const getAllUserMediaQueryParamSchema = z.object({
	page: queryParamPageSchema("Page"),
	sort: sortParamSchema(mediaColumnFilterKinds),
	[ViewParamSyntaxEnum.FILTER_MODE_PARAM]: filterModeParamSchema,
	[MediaColumnEnum.TITLE]: mediaFilterParamSchema(MediaColumnEnum.TITLE),
	[MediaColumnEnum.MEDIA_TYPE]: mediaFilterParamSchema(
		MediaColumnEnum.MEDIA_TYPE,
	),
	[MediaColumnEnum.ORIGINAL_LANGUAGE]: mediaFilterParamSchema(
		MediaColumnEnum.ORIGINAL_LANGUAGE,
	),
	[MediaColumnEnum.SAGA]: mediaFilterParamSchema(MediaColumnEnum.SAGA),
	[MediaColumnEnum.SAGA_NUMBER]: mediaFilterParamSchema(
		MediaColumnEnum.SAGA_NUMBER,
	),
	[MediaColumnEnum.RELEASE_DATE]: mediaFilterParamSchema(
		MediaColumnEnum.RELEASE_DATE,
	),
	[MediaColumnEnum.RUNTIME]: mediaFilterParamSchema(MediaColumnEnum.RUNTIME),
	[MediaColumnEnum.IN_PROGRESS]: mediaFilterParamSchema(
		MediaColumnEnum.IN_PROGRESS,
	),
	[MediaColumnEnum.COMMENT]: mediaFilterParamSchema(MediaColumnEnum.COMMENT),
	[MediaColumnEnum.WATCHED]: mediaFilterParamSchema(MediaColumnEnum.WATCHED),
	[MediaColumnEnum.UP_NEXT]: mediaFilterParamSchema(MediaColumnEnum.UP_NEXT),
	[MediaColumnEnum.TMDB_ID]: mediaFilterParamSchema(MediaColumnEnum.TMDB_ID),
});
