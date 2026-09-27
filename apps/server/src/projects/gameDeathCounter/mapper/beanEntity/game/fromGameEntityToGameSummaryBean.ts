import type { GameSummaryBean } from "../../../bean/gameSummary.bean.ts";
import type { Game } from "../../../models/Game.ts";

export function fromGameEntityToGameSummaryBean(
	game: Game,
	totalDeath: number,
): GameSummaryBean {
	const gameSummaryBean = {
		id: game.id,
		name: game.name,
		startedAt: game.createdAt,
		endedAt: game.endedAt,
		totalDeath,
	};
	return gameSummaryBean;
}
