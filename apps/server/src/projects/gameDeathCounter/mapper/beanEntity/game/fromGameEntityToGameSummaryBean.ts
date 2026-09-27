import type { GameSummaryBean } from "../../../bean/gameSummary.bean.ts";
import type { Game } from "../../../models/Game.ts";

export function fromGameEntityToGameSummaryBean(game: Game): GameSummaryBean {
	const gameSummaryBean = {
		id: game.id,
		name: game.name,
		startedAt: game.createdAt,
		endedAt: game.endedAt,
		totalDeath: 0, // TODO TOTAL DEATH
	};
	return gameSummaryBean;
}
