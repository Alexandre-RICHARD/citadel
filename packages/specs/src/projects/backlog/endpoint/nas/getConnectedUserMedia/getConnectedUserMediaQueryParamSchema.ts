import { z } from "zod";

import { queryParamPageSchema } from "../../../../../specUtils/schemaValidator/number/queryParamPageSchema.ts";
import { MediaColumnEnum } from "../../../enum/mediaColumn.enum.ts";
import { NasColumnEnum } from "../../../enum/nasColumn.enum.ts";
import type { ConnectedMediaColumn } from "../../../helper/view/connectedMediaColumn.type.ts";
import { connectedMediaColumnFilterKinds } from "../../../helper/view/connectedMediaColumnFilterKinds.ts";
import { ViewParamSyntaxEnum } from "../../../helper/view/viewParamSyntax.enum.ts";
import { filterModeParamSchema } from "../../../schema/filterModeParamSchema.ts";
import { filterParamSchema } from "../../../schema/filterParamSchema.ts";
import { sortParamSchema } from "../../../schema/sortParamSchema.ts";

function connectedFilterParamSchema(column: ConnectedMediaColumn) {
	return filterParamSchema(connectedMediaColumnFilterKinds, column);
}

// Même écriture que l'URL de la page, colonnes du NAS comprises
export const getConnectedUserMediaQueryParamSchema = z.object({
	page: queryParamPageSchema("Page"),
	sort: sortParamSchema(connectedMediaColumnFilterKinds),
	[ViewParamSyntaxEnum.FILTER_MODE_PARAM]: filterModeParamSchema,
	[MediaColumnEnum.TITLE]: connectedFilterParamSchema(MediaColumnEnum.TITLE),
	[MediaColumnEnum.MEDIA_TYPE]: connectedFilterParamSchema(
		MediaColumnEnum.MEDIA_TYPE,
	),
	[MediaColumnEnum.ORIGINAL_LANGUAGE]: connectedFilterParamSchema(
		MediaColumnEnum.ORIGINAL_LANGUAGE,
	),
	[MediaColumnEnum.SAGA]: connectedFilterParamSchema(MediaColumnEnum.SAGA),
	[MediaColumnEnum.SAGA_NUMBER]: connectedFilterParamSchema(
		MediaColumnEnum.SAGA_NUMBER,
	),
	[MediaColumnEnum.RELEASE_DATE]: connectedFilterParamSchema(
		MediaColumnEnum.RELEASE_DATE,
	),
	[MediaColumnEnum.RUNTIME]: connectedFilterParamSchema(
		MediaColumnEnum.RUNTIME,
	),
	[MediaColumnEnum.IN_PROGRESS]: connectedFilterParamSchema(
		MediaColumnEnum.IN_PROGRESS,
	),
	[MediaColumnEnum.COMMENT]: connectedFilterParamSchema(
		MediaColumnEnum.COMMENT,
	),
	[MediaColumnEnum.WATCHED]: connectedFilterParamSchema(
		MediaColumnEnum.WATCHED,
	),
	[MediaColumnEnum.UP_NEXT]: connectedFilterParamSchema(
		MediaColumnEnum.UP_NEXT,
	),
	[MediaColumnEnum.TMDB_ID]: connectedFilterParamSchema(
		MediaColumnEnum.TMDB_ID,
	),
	[NasColumnEnum.VERIFIED]: connectedFilterParamSchema(NasColumnEnum.VERIFIED),
	[NasColumnEnum.STORAGE]: connectedFilterParamSchema(NasColumnEnum.STORAGE),
	[NasColumnEnum.JELLYFIN_COLLECTION]: connectedFilterParamSchema(
		NasColumnEnum.JELLYFIN_COLLECTION,
	),
	[NasColumnEnum.SHARING]: connectedFilterParamSchema(NasColumnEnum.SHARING),
	[NasColumnEnum.TORRENTS]: connectedFilterParamSchema(NasColumnEnum.TORRENTS),
	[NasColumnEnum.QUALITY]: connectedFilterParamSchema(NasColumnEnum.QUALITY),
	[NasColumnEnum.LANGUAGES]: connectedFilterParamSchema(
		NasColumnEnum.LANGUAGES,
	),
	[NasColumnEnum.SIZE]: connectedFilterParamSchema(NasColumnEnum.SIZE),
	[NasColumnEnum.GB_PER_HOUR]: connectedFilterParamSchema(
		NasColumnEnum.GB_PER_HOUR,
	),
	[NasColumnEnum.GAPS]: connectedFilterParamSchema(NasColumnEnum.GAPS),
});
