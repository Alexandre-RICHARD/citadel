import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { PlatformBean } from "../../bean/platformBean.type.ts";
import { Platform } from "../../models/Platform.ts";

// Les plateformes IGDB qui manquent ; une plateforme déjà en base garde ses noms (synchronisation : pour plus tard)
export async function insertPlatformsQuery(
	platforms: PlatformBean[],
	transaction: Transaction,
): Promise<void> {
	const uniquePlatforms = [
		...new Map(platforms.map((platform) => [platform.id, platform])).values(),
	];
	if (uniquePlatforms.length === 0) return;

	try {
		await Platform.bulkCreate(
			uniquePlatforms.map((platform) => ({
				id: platform.id,
				shortName: platform.shortName,
				technicalName: platform.technicalName,
				emulatedPlatformId: platform.emulatedPlatformId,
			})),
			{ ignoreDuplicates: true, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to insert platforms", { cause: error });
	}
}
