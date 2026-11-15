import type { MutationCache, QueryClient } from "@tanstack/react-query";

import { createPendingMutationCounter } from "./createPendingMutationCounter";

const counters = new WeakMap<
	MutationCache,
	ReturnType<typeof createPendingMutationCounter>
>();

// Un seul compteur par cache de mutations, quel que soit le nombre de composants qui le lisent
export function getPendingMutationCounter(queryClient: QueryClient) {
	const mutationCache = queryClient.getMutationCache();
	const existing = counters.get(mutationCache);
	if (existing !== undefined) return existing;
	const counter = createPendingMutationCounter(mutationCache);
	counters.set(mutationCache, counter);
	return counter;
}
