import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { CreateGameBean } from "../../bean/createGame.bean.ts";
import { Game } from "../../models/Game.ts";

export async function createGameQuery(
	createGameBean: CreateGameBean,
): Promise<Game> {
	try {
		return await Game.create({
			name: createGameBean.name,
			endedAt: null,
		});
	} catch {
		throw new DatabaseError("Failed to insert new game");
	}
}
