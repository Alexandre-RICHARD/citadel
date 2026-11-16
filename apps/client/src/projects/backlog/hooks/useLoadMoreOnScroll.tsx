import { type RefObject, useEffect, useRef } from "react";

/**
 * Défilement infini : la page suivante se charge à l'approche du bas de page, avant de l'atteindre. Le repère rendu (ref)
 * se place sous le tableau ; `rowCount` relance l'observation après chaque page chargée
 */
export function useLoadMoreOnScroll(
	hasNextPage: boolean,
	rowCount: number,
	onLoadNextPage: () => void,
): RefObject<HTMLDivElement | null> {
	const loadMoreRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const loadMore = loadMoreRef.current;
		if (!hasNextPage || loadMore === null) return undefined;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some(({ isIntersecting }) => isIntersecting))
					onLoadNextPage();
			},
			{ rootMargin: "0px 0px 800px 0px" },
		);
		observer.observe(loadMore);
		return () => observer.disconnect();
	}, [hasNextPage, rowCount, onLoadNextPage]);
	return loadMoreRef;
}
