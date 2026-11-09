import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";

import { buildUserGameView } from "./buildUserGameView.ts";
import type { UserGameView } from "./userGameView.type.ts";

/**
 * Un filtre sur la plateforme n'affiche que les versions jouées sur elle, et sur elle seule : filtrer « PC » ne montre
 * pas Steam, filtrer « PS3 » ne montre pas RPCS3. La ligne du jeu est recalculée sur les versions gardées : un jeu joué
 * sur PS3 et sur Steam, filtré sur Steam, devient une ligne simple ; il reste dépliable s'il a plusieurs versions
 * sur ce support. Sans filtre plateforme, rien ne change
 */
export function restrictUserGameViewsToPlatforms(
	views: UserGameView[],
	filters: ColumnFilter[],
): UserGameView[] {
	const platformFilter = filters.find(
		(filter) =>
			filter.column === BacklogColumnEnum.PLATFORM &&
			filter.kind === ColumnFilterKindEnum.VALUE,
	);
	if (platformFilter?.kind !== ColumnFilterKindEnum.VALUE) return views;

	return views.map((view) => {
		const { userVersions } = view.userGame;
		const kept = userVersions.filter(({ platform }) =>
			platformFilter.values.includes(platform.shortName),
		);
		if (kept.length === userVersions.length) return view;
		return buildUserGameView({ ...view.userGame, userVersions: kept });
	});
}
