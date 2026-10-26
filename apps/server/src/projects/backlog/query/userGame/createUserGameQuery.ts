import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

type NewUserGame = {
	gameId: number;
	imageId: string | null;
	endingType: EndingTypeEnum;
	seriesId: number | null;
	seriesNumber: number | null;
};

export async function createUserGameQuery(
	userGame: NewUserGame,
	transaction: Transaction,
): Promise<void> {
	try {
		await UserGame.create(userGame, { transaction });
	} catch (error) {
		throw new DatabaseError("Failed to insert backlog game", { cause: error });
	}
}
