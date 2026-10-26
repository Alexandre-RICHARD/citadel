import type { UserGameBean } from "../bean/userGameBean.type.ts";
import { loadUserGameBeans } from "./loadUserGameBeans.ts";

// La ligne d'un jeu du backlog, après une écriture qui la garantit : son absence est un bug, donc une 500
export async function loadUserGameBean(gameId: number): Promise<UserGameBean> {
	const [userGame] = await loadUserGameBeans([gameId]);
	if (userGame === undefined)
		throw new Error(`Backlog game ${gameId} has no row after being written`);
	return userGame;
}
