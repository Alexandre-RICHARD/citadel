import { QueryClient } from "@tanstack/react-query";

import { shouldRetryQuery } from "../common/api/query/shouldRetryQuery";

const STALE_TIME_MS = 30_000;

export const tanStackQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: STALE_TIME_MS,
			retry: shouldRetryQuery,
			// L'UI affiche l'erreur au lieu d'attendre indéfiniment le retour du réseau
			networkMode: "always",
		},
		mutations: {
			retry: false,
			networkMode: "always",
		},
	},
});
