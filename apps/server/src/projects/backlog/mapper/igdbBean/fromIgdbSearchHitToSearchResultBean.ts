import { fromUnixSecondsToDate } from "@citadel/common/src/universal/date/fromUnixSecondsToDate.ts";
import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";

import type { SearchResultBean } from "../../bean/searchResultBean.type.ts";
import type { IgdbSearchHit } from "../../igdb/type/igdbSearchHit.type.ts";
import { findFrenchName } from "./findFrenchName.ts";

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
				: fromUnixSecondsToDate(game.first_release_date).getUTCFullYear(),
		coverImageId: game.cover?.image_id ?? null,
		platformNames: (game.platforms ?? []).map(
			(platform) => trimToNull(platform.abbreviation) ?? platform.name,
		),
		storedGameId: null,
		isInBacklog: false,
	};
}
