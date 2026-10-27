import { setFavicon } from "@citadel/common/src/browser/dom/setFavicon";
import { useLayoutEffect } from "react";
import { useMatches } from "react-router";

import type { RouteMeta } from "./routeMeta.type";

export function useAppNavigation() {
	const matches = useMatches();

	// En layout effect : le titre du projet passe avant celui qu'une page précise ensuite dans un useEffect
	// (la homepage nomme le projet sélectionné)
	useLayoutEffect(() => {
		const firstRouteWithMetaData = matches.find((matchRoute) =>
			Boolean(matchRoute.handle),
		);

		if (firstRouteWithMetaData) {
			const metaData = firstRouteWithMetaData.handle as RouteMeta;
			document.title = metaData.documentTitle;
			setFavicon(metaData.favicon);
		}
	}, [matches]);
}
