import { buildUserGameView } from "./buildUserGameView.ts";
import type { UserGameView } from "./userGameView.type.ts";

/**
 * Sans tri choisi, les versions jouées d'un jeu qu'on déplie suivent la même règle que les jeux : la dernière créée ou
 * modifiée en premier. À égalité, l'ordre d'ajout reste
 */
export function sortUserVersionsByActivity(
	views: UserGameView[],
): UserGameView[] {
	return views.map((view) => {
		const userVersions = view.userGame.userVersions.toSorted(
			(first, second) => second.updatedAt.getTime() - first.updatedAt.getTime(),
		);
		const isSameOrder = userVersions.every(
			({ id }, index) => id === view.userGame.userVersions.at(index)?.id,
		);
		return isSameOrder
			? view
			: buildUserGameView({ ...view.userGame, userVersions });
	});
}
