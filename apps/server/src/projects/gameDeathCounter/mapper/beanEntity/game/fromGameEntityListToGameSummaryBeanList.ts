import type { GameSummaryBean } from "../../../bean/gameSummary.bean.ts";
import type { Game } from "../../../models/Game.ts";
import { fromGameEntityToGameSummaryBean } from "./fromGameEntityToGameSummaryBean.ts";

export function fromGameEntityListToGameSummaryBeanList(
	game: Game[],
): GameSummaryBean[] {
	const gameSummaryBeanList = game.map(fromGameEntityToGameSummaryBean);
	return gameSummaryBeanList;
}
