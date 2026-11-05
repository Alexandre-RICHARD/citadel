import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { BossWithDeathsEntity } from "../../dbType/bossWithDeathsEntity.type.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";
import { ownedGameIds } from "../ownership/ownedGameIds.ts";

export async function getBossWithDeathsByIdQuery(
	userId: number,
	id: number,
): Promise<BossWithDeathsEntity | null> {
	try {
		const bossWithDeaths = await Boss.findOne({
			where: { id, gameId: ownedGameIds(userId) },
			include: { model: Death, as: "deaths" },
			order: [
				[{ model: Death, as: "deaths" }, "date", "ASC"],
				// Départage les dates identiques
				[{ model: Death, as: "deaths" }, "id", "ASC"],
			],
		});
		// Obliger de cast pour typer fortement le include ci-dessus qui garantit la présence de `deaths`, que Sequelize ne sait pas typer
		return bossWithDeaths as BossWithDeathsEntity | null;
	} catch (error) {
		throw new DatabaseError("Failed to fetch boss with deaths", {
			cause: error,
		});
	}
}
