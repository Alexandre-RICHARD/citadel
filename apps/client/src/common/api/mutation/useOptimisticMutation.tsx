import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type";
import { hashKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useSyncExternalStore } from "react";

import { fetchHandler } from "../fetch/fetchHandler";
import { buildOptimisticMutationCallbacks } from "./buildOptimisticMutationCallbacks";
import { getPendingMutationCounter } from "./getPendingMutationCounter";
import { notifyMutationFailure } from "./notifyMutationFailure";
import type { OptimisticMutationOptions } from "./optimisticMutationOptions.type";

/**
 * Mutation appliquée tout de suite dans le cache, défaite si le serveur la refuse.
 * Une seule à la fois par mutationKey : tant qu'elle est en cours, mutate ne fait rien et isPending désactive le bouton
 */
export function useOptimisticMutation<
	Endpoint extends EndpointModel,
	Variables,
	Rollback,
>(options: OptimisticMutationOptions<Endpoint, Variables, Rollback>) {
	const queryClient = useQueryClient();
	// Le tableau monte une mutation par cellule : useIsMutating, qui reparcourt tout le cache pour chacune, le figeait
	const pendingMutations = getPendingMutationCounter(queryClient);
	const keyHash = hashKey(options.mutationKey);
	const subscribe = useCallback(
		(listener: () => void) => pendingMutations.subscribe(keyHash, listener),
		[pendingMutations, keyHash],
	);
	const pendingCount = useSyncExternalStore(subscribe, () =>
		pendingMutations.getCount(keyHash),
	);

	// Lu dans le compteur plutôt que dans l'état React : deux clics rapprochés tombent avant le prochain rendu
	function mutateIfIdle(
		run: (variables: Variables) => void,
		variables: Variables,
	): void {
		if (pendingMutations.getCount(keyHash) === 0) run(variables);
	}

	const mutation = useMutation({
		mutationKey: options.mutationKey,
		...(options.scope !== undefined && { scope: { id: options.scope } }),
		mutationFn: async (variables: Variables) =>
			(await fetchHandler<Endpoint>(options.buildRequest(variables))).data,
		...buildOptimisticMutationCallbacks({
			queryClient,
			options,
			notifyFailure: notifyMutationFailure,
			retry: (variables) => mutateIfIdle(mutation.mutate, variables),
		}),
	});

	return {
		mutate: (variables: Variables) => mutateIfIdle(mutation.mutate, variables),
		isPending: pendingCount > 0,
	};
}
