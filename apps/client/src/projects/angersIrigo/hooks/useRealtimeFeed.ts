/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { useEffect, useState } from "react";

import { type FetchedFeed, fetchFeed } from "../api/feed";
import {
	FEED_FALLBACK_REFRESH_MS,
	FEED_UPDATE_MARGIN_MS,
	FEED_UPDATE_PERIOD_MS,
	STALE_FEED_RETRY_MS,
} from "../config";
import type { FeedMessage } from "../types/gtfs-realtime";
import type { LoadStatus } from "../types/load-status";

export type RealtimeFeedState = {
	/** Dernier flux reçu ; conservé en cas d'erreur sur les rafraîchissements suivants */
	feed?: FeedMessage;
	status: LoadStatus;
	/** Heure de génération du dernier flux reçu */
	updatedAt?: Date;
};

const MS_PER_SECOND = 1000;

/**
 * Délai avant la prochaine requête :
 * - flux neuf : sa prochaine génération est attendue FEED_UPDATE_PERIOD_MS après la sienne ; on
 *   le redemande FEED_UPDATE_MARGIN_MS plus tard. Ex. : généré il y a 24 s → 60 − 24 + 2 = 38 s ;
 * - flux pas plus récent que le précédent (génération en retard) : nouvel essai rapide ;
 * - flux sans heure de génération : rythme fixe, faute de pouvoir se caler.
 * L'âge du flux se mesure à l'heure du serveur, pas à celle du navigateur, qui peut être décalée.
 */
function getNextRefreshDelay(
	{ feed, serverTime }: FetchedFeed,
	isFresh: boolean,
): number {
	const feedTimestamp = feed.header.timestamp;
	if (feedTimestamp === undefined) {
		return FEED_FALLBACK_REFRESH_MS;
	}
	if (!isFresh) {
		return STALE_FEED_RETRY_MS;
	}
	const ageMs = serverTime - feedTimestamp * MS_PER_SECOND;
	const delay = FEED_UPDATE_PERIOD_MS - ageMs + FEED_UPDATE_MARGIN_MS;
	// Génération attendue déjà passée : on réessaie vite. Horloges incohérentes (âge négatif) :
	// jamais plus d'une période d'attente.
	return Math.min(
		Math.max(delay, STALE_FEED_RETRY_MS),
		FEED_UPDATE_PERIOD_MS + FEED_UPDATE_MARGIN_MS,
	);
}

/** Flux GTFS-RT, redemandé juste après chacune de ses générations (voir getNextRefreshDelay) */
export function useRealtimeFeed(url: string): RealtimeFeedState {
	const [state, setState] = useState<RealtimeFeedState>({ status: "loading" });

	useEffect(() => {
		// Annule la requête en cours au démontage. En dev, le StrictMode de React monte le
		// composant deux fois : sans ça, la réponse du premier montage arriverait quand même.
		const controller = new AbortController();
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		// Heure de génération du dernier flux reçu, pour reconnaître un flux neuf
		let lastFeedTimestamp: number | undefined;

		async function refresh(): Promise<void> {
			let delay = FEED_FALLBACK_REFRESH_MS;
			try {
				const fetched = await fetchFeed(url, controller.signal);
				const feedTimestamp = fetched.feed.header.timestamp;
				const isFresh =
					feedTimestamp === undefined ||
					lastFeedTimestamp === undefined ||
					feedTimestamp > lastFeedTimestamp;
				delay = getNextRefreshDelay(fetched, isFresh);

				if (isFresh) {
					lastFeedTimestamp = feedTimestamp;
					const updatedAt =
						feedTimestamp !== undefined
							? new Date(feedTimestamp * MS_PER_SECOND)
							: new Date();
					setState({ feed: fetched.feed, status: "success", updatedAt });
				} else {
					// Mêmes données : rien à recalculer, sauf sortir d'un état d'erreur
					setState((previous) =>
						previous.status === "success"
							? previous
							: { ...previous, status: "success" },
					);
				}
			} catch (error: unknown) {
				if (controller.signal.aborted) {
					return;
				}
				console.error(`Impossible de récupérer ${url} :`, error);
				setState((previous) => ({ ...previous, status: "error" }));
			}
			if (!controller.signal.aborted) {
				timeoutId = setTimeout(() => {
					void refresh();
				}, delay);
			}
		}

		void refresh();

		return () => {
			clearTimeout(timeoutId);
			controller.abort();
		};
	}, [url]);

	return state;
}
