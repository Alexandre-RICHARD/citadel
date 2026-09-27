import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { CreateGameBean } from "../../bean/createGame.bean.ts";
import { Game } from "../../models/Game.ts";

export async function createGameQuery(
	createGameBean: CreateGameBean,
): Promise<Game> {
	try {
		const newGame = await Game.create({
			name: createGameBean.name,
			endedAt: null,
		});
		return newGame;
	} catch (error) {
		throw new DatabaseError("Failed to insert new game", { cause: error });
	}
}
