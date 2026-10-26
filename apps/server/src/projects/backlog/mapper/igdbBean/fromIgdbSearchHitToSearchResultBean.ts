import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";

import type { SearchResultBean } from "../../bean/searchResultBean.type.ts";
import type { IgdbSearchHit } from "../../igdb/type/igdbSearchHit.type.ts";
import { findFrenchName } from "./findFrenchName.ts";

const SECOND_MS = 1000;

// Un résultat de recherche, pas encore comparé à la base : le service renseigne `storedGameId` et `isInBacklog`
export function fromIgdbSearchHitToSearchResultBean({
	game,
	matchedName,
}: IgdbSearchHit): SearchResultBean {
	return {
		igdbId: game.id,
		name: game.name,
		frenchName: findFrenchName(game.name, game.alternative_names),
		matchedName,
		releaseYear:
			game.first_release_date === undefined
				? null
				: new Date(game.first_release_date * SECOND_MS).getUTCFullYear(),
		coverImageId: game.cover?.image_id ?? null,
		platformNames: (game.platforms ?? []).map(
			(platform) => trimToNull(platform.abbreviation) ?? platform.name,
		),
		storedGameId: null,
		isInBacklog: false,
	};
}
