import type { ProposedSeriesBean } from "../../bean/proposedSeriesBean.type.ts";
import type { IgdbOriginalGame } from "../../igdb/type/igdbOriginalGame.type.ts";

/**
 * Série proposée par IGDB (cahier des charges, §3) : la collection la plus large, sans parente parmi celles du jeu ;
 * sinon la franchise principale, sinon la première ; sinon aucune
 */
export function getIgdbProposedSeries(
	original: IgdbOriginalGame,
): ProposedSeriesBean | null {
	const collections = original.collections ?? [];
	const collectionIds = collections.map(({ id }) => id);
	const collection =
		collections.find(
			({ as_child_relations: parentRelations = [] }) =>
				!parentRelations.some(
					({ parent_collection: parentId }) =>
						parentId !== undefined && collectionIds.includes(parentId),
				),
		) ?? collections.at(0);
	if (collection !== undefined)
		return {
			name: collection.name,
			igdbCollectionId: collection.id,
			igdbFranchiseId: null,
		};

	const franchise = original.franchise ?? original.franchises?.at(0);
	return franchise === undefined
		? null
		: {
				name: franchise.name,
				igdbCollectionId: null,
				igdbFranchiseId: franchise.id,
			};
}
