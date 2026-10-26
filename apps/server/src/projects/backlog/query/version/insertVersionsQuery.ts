import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { GameImportVersionBean } from "../../bean/gameImportVersionBean.type.ts";
import { Version } from "../../models/Version.ts";
import { VersionPlatform } from "../../models/VersionPlatform.ts";

/**
 * Les versions d'un jeu et leurs plateformes. Une version déjà en base est ignorée (pas de doublon, §5) ;
 * ses plateformes aussi : une version n'existe qu'une fois, avec ses plateformes de son premier enregistrement
 */
export async function insertVersionsQuery(
	gameId: number,
	versions: GameImportVersionBean[],
	transaction: Transaction,
): Promise<void> {
	if (versions.length === 0) return;

	try {
		const existingIds = new Set(
			(
				await Version.findAll({
					attributes: ["id"],
					where: { id: versions.map(({ id }) => id) },
					transaction,
				})
			).map(({ id }) => id),
		);
		const newVersions = versions.filter(({ id }) => !existingIds.has(id));
		await Version.bulkCreate(
			newVersions.map((version) => ({
				id: version.id,
				gameId,
				title: version.title,
				coverImageId: version.coverImageId,
				igdbUrl: version.igdbUrl,
			})),
			{ transaction },
		);
		await VersionPlatform.bulkCreate(
			newVersions.flatMap((version) =>
				version.platforms.map(({ platform, releaseDate }) => ({
					versionId: version.id,
					platformId: platform.id,
					releaseDate,
				})),
			),
			{ transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to insert versions", { cause: error });
	}
}
