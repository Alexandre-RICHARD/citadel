import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { DlcBean } from "../../bean/dlcBean.type.ts";
import { Dlc } from "../../models/Dlc.ts";

// Les DLC d'un jeu ; un DLC déjà en base est ignoré (pas de doublon)
export async function insertDlcsQuery(
	gameId: number,
	dlcs: DlcBean[],
	transaction: Transaction,
): Promise<void> {
	if (dlcs.length === 0) return;

	try {
		await Dlc.bulkCreate(
			dlcs.map(({ id, name }) => ({ id, gameId, name })),
			{ ignoreDuplicates: true, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to insert DLCs", { cause: error });
	}
}
