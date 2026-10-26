import type { UserGameBean } from "./userGameBean.type.ts";

export type UserGamePageBean = {
	userGames: UserGameBean[];
	matchedCount: number;
};
