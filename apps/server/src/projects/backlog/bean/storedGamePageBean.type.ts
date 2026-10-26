import type { StoredGameSummaryBean } from "./storedGameSummaryBean.type.ts";

export type StoredGamePageBean = {
	games: StoredGameSummaryBean[];
	totalCount: number;
};
