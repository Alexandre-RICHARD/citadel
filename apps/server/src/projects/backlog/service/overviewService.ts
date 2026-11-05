import type { BacklogOverviewBean } from "../bean/backlogOverviewBean.type.ts";
import { countOutsideBacklogGamesQuery } from "../query/game/countOutsideBacklogGamesQuery.ts";
import { getPlayedPlatformsQuery } from "../query/platform/getPlayedPlatformsQuery.ts";
import { countUserGamesQuery } from "../query/userGame/countUserGamesQuery.ts";
import { countUserVersionsQuery } from "../query/userVersion/countUserVersionsQuery.ts";

class OverviewService {
	// Les chiffres du backlog du compte ; « Ma base » : les jeux en base qui ne sont pas dans son backlog
	async getOverview(userId: number): Promise<BacklogOverviewBean> {
		const [
			gameCount,
			userVersionCount,
			outsideBacklogGameCount,
			playedPlatforms,
		] = await Promise.all([
			countUserGamesQuery(userId),
			countUserVersionsQuery(userId),
			countOutsideBacklogGamesQuery(userId, ""),
			getPlayedPlatformsQuery(userId),
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
