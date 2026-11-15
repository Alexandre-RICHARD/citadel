import {
	hashKey,
	type MutationCache,
	type MutationCacheNotifyEvent,
} from "@tanstack/react-query";

type CachedMutation = NonNullable<MutationCacheNotifyEvent["mutation"]>;

/**
 * Le nombre de mutations en cours par clé (hachée par hashKey), tenu à jour événement par événement : seuls les abonnés
 * de la clé qui change sont prévenus. useIsMutating, lui, reparcourt tout le cache des mutations (gardées 5 minutes
 * après leur fin) en hachant chaque clé, pour chacun de ses abonnés à chaque événement : avec une mutation par cellule
 * du tableau, quelques modifications rapides figeaient la page
 */
export function createPendingMutationCounter(mutationCache: MutationCache) {
	const keyHashOfPending = new Map<CachedMutation, string>();
	const countByKeyHash = new Map<string, number>();
	const listenersByKeyHash = new Map<string, Set<() => void>>();

	function shiftCount(keyHash: string, delta: number): void {
		const count = (countByKeyHash.get(keyHash) ?? 0) + delta;
		if (count === 0) countByKeyHash.delete(keyHash);
		else countByKeyHash.set(keyHash, count);
		listenersByKeyHash.get(keyHash)?.forEach((listener) => listener());
	}

	function track(mutation: CachedMutation, isInCache: boolean): void {
		const isPending = isInCache && mutation.state.status === "pending";
		const trackedKeyHash = keyHashOfPending.get(mutation);
		if (trackedKeyHash !== undefined) {
			if (isPending) return;
			keyHashOfPending.delete(mutation);
			shiftCount(trackedKeyHash, -1);
			return;
		}
		const { mutationKey } = mutation.options;
		if (!isPending || mutationKey === undefined) return;
		const keyHash = hashKey(mutationKey);
		keyHashOfPending.set(mutation, keyHash);
		shiftCount(keyHash, 1);
	}

	mutationCache.getAll().forEach((mutation) => track(mutation, true));
	mutationCache.subscribe(({ mutation, type }) => {
		if (mutation !== undefined) track(mutation, type !== "removed");
	});

	return {
		getCount: (keyHash: string): number => countByKeyHash.get(keyHash) ?? 0,
		subscribe: (keyHash: string, listener: () => void): (() => void) => {
			const listeners = listenersByKeyHash.get(keyHash) ?? new Set();
			listeners.add(listener);
			listenersByKeyHash.set(keyHash, listeners);
			return () => {
				listeners.delete(listener);
				if (listeners.size === 0) listenersByKeyHash.delete(keyHash);
			};
		},
	};
}
