import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { StoredGameEntity } from "../../dbType/storedGameEntity.type.ts";
import { Company } from "../../models/Company.ts";
import { Dlc } from "../../models/Dlc.ts";
import { Game } from "../../models/Game.ts";
import { Platform } from "../../models/Platform.ts";
import { Series } from "../../models/Series.ts";
import { UserGame } from "../../models/UserGame.ts";
import { Version } from "../../models/Version.ts";
import { VersionPlatform } from "../../models/VersionPlatform.ts";

// Les listes (versions, DLC) se lisent chacune à part (`separate`) : une seule jointure les multiplierait entre elles
export async function getStoredGameEntityQuery(
	gameId: number,
	transaction: Transaction | null = null,
): Promise<StoredGameEntity | null> {
	try {
		const game = await Game.findByPk(gameId, {
			include: [
				{ model: Series, as: "proposedSeries" },
				{ model: Company, as: "developer" },
				{ model: Company, as: "publisher" },
				{
					model: Version,
					as: "versions",
					separate: true,
					include: [
						{
							model: VersionPlatform,
							as: "versionPlatforms",
							include: [{ model: Platform, as: "platform" }],
						},
					],
				},
				{ model: Dlc, as: "dlcs", separate: true, order: [["id", "ASC"]] },
				{
					model: UserGame,
					as: "userGame",
					include: [{ model: Series, as: "series" }],
				},
			],
			transaction,
		});
		// Obligé de caster : les include ci-dessus garantissent ces propriétés, que Sequelize ne sait pas typer
		return game as StoredGameEntity | null;
	} catch (error) {
		throw new DatabaseError("Failed to fetch stored game", { cause: error });
	}
}
