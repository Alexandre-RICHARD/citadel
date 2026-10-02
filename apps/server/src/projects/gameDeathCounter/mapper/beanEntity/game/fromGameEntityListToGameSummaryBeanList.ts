import type { GameSummaryBean } from "../../../bean/gameSummaryBean.type.ts";
import type { Game } from "../../../models/Game.ts";
import { fromGameEntityToGameSummaryBean } from "./fromGameEntityToGameSummaryBean.ts";

export function fromGameEntityListToGameSummaryBeanList(
	games: Game[],
	totalDeathByGameId: Map<number, number>,
): GameSummaryBean[] {
	const gameSummaryBeanList = games.map((game) =>
		fromGameEntityToGameSummaryBean(game, totalDeathByGameId.get(game.id) ?? 0),
	);
	return gameSummaryBeanList;
}
