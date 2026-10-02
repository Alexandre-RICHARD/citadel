import { setFavicon } from "@citadel/common/src/browser/dom/setFavicon";
import { useEffect } from "react";
import { useMatches } from "react-router";

import type { RouteMeta } from "./routeMeta.type";

export function useAppNavigation() {
	const matches = useMatches();

	useEffect(() => {
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
