import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

type UserGameCustomization = {
	imageId: string | null;
	endingType: EndingTypeEnum;
	seriesId: number | null;
	seriesNumber: number | null;
};

export async function updateUserGameQuery(
	gameId: number,
	customization: UserGameCustomization,
	transaction: Transaction,
): Promise<void> {
	try {
		await UserGame.update(customization, { where: { gameId }, transaction });
	} catch (error) {
		throw new DatabaseError("Failed to update backlog game", { cause: error });
	}
}
