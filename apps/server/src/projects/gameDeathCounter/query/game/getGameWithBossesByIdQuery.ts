import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { GameWithBossesEntity } from "../../dbType/gameWithBossesEntity.ts";
import { Boss } from "../../models/Boss.ts";
import { Game } from "../../models/Game.ts";

export async function getGameWithBossesByIdQuery(
	id: number,
): Promise<GameWithBossesEntity | null> {
	try {
		const gameWithBosses = await Game.findByPk(id, {
			include: { model: Boss, as: "bosses" },
			order: [
				[{ model: Boss, as: "bosses" }, "createdAt", "ASC"],
				[{ model: Boss, as: "bosses" }, "id", "ASC"],
			],
		});
		// Obliger de cast pour typer fortement le include ci-dessus qui garantit la présence de `bosses`, que Sequelize ne sait pas typer
		return gameWithBosses as GameWithBossesEntity | null;
	} catch (error) {
		throw new DatabaseError("Failed to fetch game with bosses", {
			cause: error,
		});
	}
}
