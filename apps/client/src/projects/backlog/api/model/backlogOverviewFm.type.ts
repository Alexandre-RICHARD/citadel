import type { PlatformFm } from "./platformFm.type";

export type BacklogOverviewFm = {
	gameCount: number;
	userVersionCount: number;
	finishedGameCount: number;
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
	outsideBacklogGameCount: number;
	playedPlatforms: PlatformFm[];
};
