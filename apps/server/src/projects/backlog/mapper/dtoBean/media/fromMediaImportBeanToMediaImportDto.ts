import type { MediaImportDto } from "@citadel/specs/src/projects/backlog/dto/mediaImport/mediaImportDto.type.ts";

import type { MediaImportBean } from "../../../bean/mediaImportBean.type.ts";

// L'aperçu ne montre pas l'affiche : elle ne sert qu'à la miniature, prise d'office
export function fromMediaImportBeanToMediaImportDto(
	mediaImport: MediaImportBean,
): MediaImportDto {
	return {
		status: mediaImport.status,
		readCount: mediaImport.readCount,
		totalCount: mediaImport.totalCount,
		recognized: mediaImport.recognized.map(
			({ mediaType, tmdbId, title, date, posterPath }) => ({
				mediaType,
				tmdbId,
				title,
				date,
				posterPath,
			}),
		),
		rejected: mediaImport.rejected.map(({ mediaType, tmdbId, reason }) => ({
			mediaType,
			tmdbId,
			reason,
		})),
	};
}
