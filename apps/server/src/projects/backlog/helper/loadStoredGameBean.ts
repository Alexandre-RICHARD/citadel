import type { Transaction } from "sequelize";

import type { StoredGameBean } from "../bean/storedGameBean.type.ts";
import { fromPlatformEntityToPlatformBean } from "../mapper/beanEntity/fromPlatformEntityToPlatformBean.ts";
import { fromStoredGameEntityToStoredGameBean } from "../mapper/beanEntity/fromStoredGameEntityToStoredGameBean.ts";
import { getStoredGameEntityQuery } from "../query/game/getStoredGameEntityQuery.ts";
import { getEmulatorsQuery } from "../query/platform/getEmulatorsQuery.ts";

// Un jeu en base, avec les plateformes proposées de chaque version ; null s'il n'y est pas
export async function loadStoredGameBean(
	gameId: number,
	transaction: Transaction | null = null,
): Promise<StoredGameBean | null> {
	const [game, emulators] = await Promise.all([
		getStoredGameEntityQuery(gameId, transaction),
		getEmulatorsQuery(),
	]);
	return game === null
		? null
		: fromStoredGameEntityToStoredGameBean(
				game,
				emulators.map(fromPlatformEntityToPlatformBean),
			);
}
