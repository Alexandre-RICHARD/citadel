import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { handleBaseError } from "../../../../error/handleBaseError.ts";
import type { CreateGameBean } from "../../bean/createGameBean.ts";
import { Game } from "../../models/Game.ts";

export async function createGameQuery(
	createGameBean: CreateGameBean,
): Promise<Game> {
	try {
		return await Game.create({
			name: createGameBean.name,
		});
	} catch (error) {
		await handleBaseError(error);
		throw new DatabaseError("Failed to insert new game");
	}
}
