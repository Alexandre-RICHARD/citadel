import { useState } from "react";

type Read = {
	data: unknown;
	isStale: boolean;
};

/**
 * Une saisie part d'une lecture fraîche : une donnée périmée en cache (invalidée par une écriture) est relue avant.
 * Attendue une seule fois, à l'ouverture : la donnée qui vieillit ensuite ne referme pas le formulaire
 */
export function useIsFreshOnce({ data, isStale }: Read): boolean {
	const isFresh = data !== undefined && !isStale;
	const [wasFresh, setWasFresh] = useState(isFresh);
	if (isFresh && !wasFresh) setWasFresh(true);
	return wasFresh || isFresh;
}
