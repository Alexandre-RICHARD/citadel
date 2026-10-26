import type { PlatformFm } from "./platformFm.type";

export type BacklogOverviewFm = {
	gameCount: number;
	userVersionCount: number;
	outsideBacklogGameCount: number;
	playedPlatforms: PlatformFm[];
};
