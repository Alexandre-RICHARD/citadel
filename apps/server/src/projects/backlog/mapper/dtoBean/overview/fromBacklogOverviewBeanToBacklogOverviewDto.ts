import type { BacklogOverviewDto } from "@citadel/specs/src/projects/backlog/dto/overview/backlogOverviewDto.type.ts";

import type { BacklogOverviewBean } from "../../../bean/backlogOverviewBean.type.ts";

export function fromBacklogOverviewBeanToBacklogOverviewDto(
	overview: BacklogOverviewBean,
): BacklogOverviewDto {
	return {
		gameCount: overview.gameCount,
		userVersionCount: overview.userVersionCount,
		finishedGameCount: overview.finishedGameCount,
		trackedPlayTimeMinutes: overview.playTimes.trackedMinutes,
		estimatedPlayTimeMinutes: overview.playTimes.estimatedMinutes,
		outsideBacklogGameCount: overview.outsideBacklogGameCount,
		playedPlatforms: overview.playedPlatforms,
	};
}
