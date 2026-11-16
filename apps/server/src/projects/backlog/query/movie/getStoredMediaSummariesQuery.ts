import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { MediaImportRecognizedBean } from "../../bean/mediaImportRecognizedBean.type.ts";
import { Movie } from "../../models/Movie.ts";
import { TvShow } from "../../models/TvShow.ts";

/**
 * Titre, date et affiche de films ou de séries déjà en base : l'import les reconnaît sans relire TMDB (§7.2). Seuls
 * ceux qui sont en base sont rendus
 */
export async function getStoredMediaSummariesQuery(
	mediaType: MediaTypeEnum,
	tmdbIds: number[],
): Promise<MediaImportRecognizedBean[]> {
	if (tmdbIds.length === 0) return [];
	try {
		if (mediaType === MediaTypeEnum.MOVIE) {
			const movies = await Movie.findAll({
				attributes: ["id", "title", "releaseDate", "posterPath"],
				where: { id: { [Op.in]: tmdbIds } },
			});
			return movies.map((movie) => ({
				mediaType,
				tmdbId: movie.id,
				title: movie.title,
				date: movie.releaseDate,
				posterPath: movie.posterPath,
			}));
		}
		const shows = await TvShow.findAll({
			attributes: ["id", "name", "firstAirDate", "posterPath"],
			where: { id: { [Op.in]: tmdbIds } },
		});
		return shows.map((show) => ({
			mediaType,
			tmdbId: show.id,
			title: show.name,
			date: show.firstAirDate,
			posterPath: show.posterPath,
		}));
	} catch (error) {
		throw new DatabaseError("Failed to fetch stored media", { cause: error });
	}
}
