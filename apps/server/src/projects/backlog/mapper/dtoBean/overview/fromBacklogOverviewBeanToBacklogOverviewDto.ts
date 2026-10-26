import type { BacklogOverviewDto } from "@citadel/specs/src/projects/backlog/dto/overview/backlogOverviewDto.type.ts";

import type { BacklogOverviewBean } from "../../../bean/backlogOverviewBean.type.ts";

export function fromBacklogOverviewBeanToBacklogOverviewDto(
	overview: BacklogOverviewBean,
): BacklogOverviewDto {
	return {
		gameCount: overview.gameCount,
		userVersionCount: overview.userVersionCount,
		outsideBacklogGameCount: overview.outsideBacklogGameCount,
		playedPlatforms: overview.playedPlatforms,
	};
}
