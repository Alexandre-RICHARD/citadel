import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { type Transaction, UniqueConstraintError } from "sequelize";

import { isRecordChangedSinceReadError } from "../../../../common/database/isRecordChangedSinceReadError.ts";
import { ConflictError } from "../../../../error/ConflictError.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

type NewUserGame = {
	userId: number;
	gameId: number;
	imageId: string | null;
	endingType: EndingTypeEnum | null;
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
		// Le même jeu ajouté en même temps par une autre requête du compte (double clic, deux onglets) : un doublon de
		// clé, ou une ligne créée depuis la première lecture de la transaction
		if (
			error instanceof UniqueConstraintError ||
			isRecordChangedSinceReadError(error)
		)
			throw new ConflictError(
				BacklogErrorCodeEnum.USER_GAME_ALREADY_EXISTS,
				`Game already in the backlog : ${userGame.gameId}`,
			);
		throw new DatabaseError("Failed to insert backlog game", { cause: error });
	}
}
