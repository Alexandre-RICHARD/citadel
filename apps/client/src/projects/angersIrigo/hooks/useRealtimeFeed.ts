/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { useEffect, useState } from "react";

import { fetchFeed } from "../api/feed";
import { REFRESH_INTERVAL_MS } from "../config";
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

/** Flux GTFS-RT, rafraîchi toutes les REFRESH_INTERVAL_MS */
export function useRealtimeFeed(url: string): RealtimeFeedState {
	const [state, setState] = useState<RealtimeFeedState>({ status: "loading" });

	useEffect(() => {
		// Annule la requête en cours au démontage. En dev, le StrictMode de React monte le
		// composant deux fois : sans ça, la réponse du premier montage arriverait quand même.
		const controller = new AbortController();

		async function refresh(): Promise<void> {
			try {
				const feed = await fetchFeed(url, controller.signal);
				const feedTimestamp = feed.header.timestamp;
				const updatedAt =
					feedTimestamp !== undefined
						? new Date(feedTimestamp * MS_PER_SECOND)
						: new Date();
				setState({ feed, status: "success", updatedAt });
			} catch (error: unknown) {
				if (controller.signal.aborted) {
					return;
				}
				console.error(`Impossible de récupérer ${url} :`, error);
				setState((previous) => ({ ...previous, status: "error" }));
			}
		}

		void refresh();
		const intervalId = setInterval(() => {
			void refresh();
		}, REFRESH_INTERVAL_MS);

		return () => {
			clearInterval(intervalId);
			controller.abort();
		};
	}, [url]);

	return state;
}
