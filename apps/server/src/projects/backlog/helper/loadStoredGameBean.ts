import type { Transaction } from "sequelize";

import type { StoredGameBean } from "../bean/storedGameBean.type.ts";
import { fromPlatformEntityToPlatformBean } from "../mapper/beanEntity/fromPlatformEntityToPlatformBean.ts";
import { fromStoredGameEntityToStoredGameBean } from "../mapper/beanEntity/fromStoredGameEntityToStoredGameBean.ts";
import { getStoredGameEntityQuery } from "../query/game/getStoredGameEntityQuery.ts";
import { getSubPlatformsQuery } from "../query/platform/getSubPlatformsQuery.ts";

// Un jeu en base, avec les plateformes proposées de chaque version et sa personnalisation dans le backlog du compte ;
// null s'il n'y est pas
export async function loadStoredGameBean(
	userId: number,
	gameId: number,
	transaction: Transaction | null = null,
): Promise<StoredGameBean | null> {
	const [game, subPlatforms] = await Promise.all([
		getStoredGameEntityQuery(userId, gameId, transaction),
		getSubPlatformsQuery(),
	]);
	return game === null
		? null
		: fromStoredGameEntityToStoredGameBean(
				game,
				subPlatforms.map(fromPlatformEntityToPlatformBean),
			);
}
