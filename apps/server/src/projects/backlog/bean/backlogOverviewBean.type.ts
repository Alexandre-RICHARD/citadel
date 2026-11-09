import type { PlatformBean } from "./platformBean.type.ts";
import type { PlayTimeTotalsBean } from "./playTimeTotalsBean.type.ts";

export type BacklogOverviewBean = {
	gameCount: number;
	userVersionCount: number;
	finishedGameCount: number;
	playTimes: PlayTimeTotalsBean;
	outsideBacklogGameCount: number;
	playedPlatforms: PlatformBean[];
};
