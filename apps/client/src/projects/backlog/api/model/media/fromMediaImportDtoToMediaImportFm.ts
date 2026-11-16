import type { MediaImportDto } from "@citadel/specs/src/projects/backlog/dto/mediaImport/mediaImportDto.type";

import { getReleaseYear } from "../../../helper/media/getReleaseYear";
import type { MediaImportFm } from "./mediaImportFm.type";

// L'aperçu de l'import : les médias reconnus par titre, comme le tableau sans tri
export function fromMediaImportDtoToMediaImportFm(
	mediaImport: MediaImportDto,
): MediaImportFm {
	return {
		status: mediaImport.status,
		readCount: mediaImport.readCount,
		totalCount: mediaImport.totalCount,
		recognized: mediaImport.recognized
			.map(({ mediaType, tmdbId, title, date, posterPath }) => ({
				mediaType,
				tmdbId,
				title,
				releaseYear: getReleaseYear(date),
				posterPath,
			}))
			.toSorted((first, second) =>
				first.title.localeCompare(second.title, "fr", { numeric: true }),
			),
		rejected: mediaImport.rejected.map(({ mediaType, tmdbId, reason }) => ({
			mediaType,
			tmdbId,
			reason,
		})),
	};
}
