import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UserGameEntity } from "../../dbType/userGameEntity.type.ts";
import { Company } from "../../models/Company.ts";
import { Game } from "../../models/Game.ts";
import { Series } from "../../models/Series.ts";
import { UserGame } from "../../models/UserGame.ts";

// Jeux du backlog, dans l'ordre d'ajout ; null : tout le backlog
export async function getUserGameEntitiesQuery(
	gameIds: number[] | null,
): Promise<UserGameEntity[]> {
	if (gameIds?.length === 0) return [];

	try {
		const userGames = await UserGame.findAll({
			where: gameIds === null ? {} : { gameId: gameIds },
			include: [
				{
					model: Game,
					as: "game",
					include: [
						{ model: Company, as: "developer" },
						{ model: Company, as: "publisher" },
						{ model: Series, as: "proposedSeries" },
					],
				},
				{ model: Series, as: "series" },
			],
			order: [
				["createdAt", "ASC"],
				["gameId", "ASC"],
			],
		});
		// Obligé de caster : les include ci-dessus garantissent ces propriétés, que Sequelize ne sait pas typer
		return userGames as UserGameEntity[];
	} catch (error) {
		throw new DatabaseError("Failed to fetch backlog games", { cause: error });
	}
}
