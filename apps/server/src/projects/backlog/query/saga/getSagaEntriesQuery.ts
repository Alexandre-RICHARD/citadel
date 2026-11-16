import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { SagaEntryBean } from "../../bean/sagaEntryBean.type.ts";
import { Movie } from "../../models/Movie.ts";
import { TvShow } from "../../models/TvShow.ts";
import { UserMedia } from "../../models/UserMedia.ts";

// Les médias du backlog du compte rangés dans une saga, par numéro, avec leur titre et leur date
export async function getSagaEntriesQuery(
	userId: number,
	sagaId: number,
): Promise<SagaEntryBean[]> {
	try {
		const rows = await UserMedia.findAll({
			where: { userId, sagaId, sagaNumber: { [Op.ne]: null } },
			include: [
				{ model: Movie, as: "movie" },
				{ model: TvShow, as: "tvShow" },
			],
			order: [["sagaNumber", "ASC"]],
		});
		return rows.flatMap(
			({ id, sagaNumber, movie, tvShow }): SagaEntryBean[] => {
				if (sagaNumber === null) return [];
				if (movie)
					return [
						{
							userMediaId: id,
							sagaNumber,
							mediaType: MediaTypeEnum.MOVIE,
							title: movie.title,
							originalTitle: movie.originalTitle,
							releaseDate: movie.releaseDate,
						},
					];
				return tvShow
					? [
							{
								userMediaId: id,
								sagaNumber,
								mediaType: MediaTypeEnum.SHOW,
								title: tvShow.name,
								originalTitle: tvShow.originalName,
								releaseDate: tvShow.firstAirDate,
							},
						]
					: [];
			},
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch saga entries", { cause: error });
	}
}
