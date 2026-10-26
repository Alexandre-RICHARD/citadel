import type { PlatformBean } from "./platformBean.type.ts";

export type BacklogOverviewBean = {
	gameCount: number;
	userVersionCount: number;
	outsideBacklogGameCount: number;
	playedPlatforms: PlatformBean[];
};
