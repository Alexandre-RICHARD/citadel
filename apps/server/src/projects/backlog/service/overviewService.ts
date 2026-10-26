import type { BacklogOverviewBean } from "../bean/backlogOverviewBean.type.ts";
import { countOutsideBacklogGamesQuery } from "../query/game/countOutsideBacklogGamesQuery.ts";
import { getPlayedPlatformsQuery } from "../query/platform/getPlayedPlatformsQuery.ts";
import { countUserGamesQuery } from "../query/userGame/countUserGamesQuery.ts";
import { countUserVersionsQuery } from "../query/userVersion/countUserVersionsQuery.ts";

class OverviewService {
	async getOverview(): Promise<BacklogOverviewBean> {
		const [
			gameCount,
			userVersionCount,
			outsideBacklogGameCount,
			playedPlatforms,
		] = await Promise.all([
			countUserGamesQuery(),
			countUserVersionsQuery(),
			countOutsideBacklogGamesQuery(""),
			getPlayedPlatformsQuery(),
		]);
		return {
			gameCount,
			userVersionCount,
			outsideBacklogGameCount,
			playedPlatforms,
		};
	}
}

export const overviewService = new OverviewService();
