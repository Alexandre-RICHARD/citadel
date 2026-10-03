import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type";
import {
	useIsMutating,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";

import { fetchHandler } from "../fetch/fetchHandler";
import { buildOptimisticMutationCallbacks } from "./buildOptimisticMutationCallbacks";
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
	const pendingCount = useIsMutating({
		mutationKey: options.mutationKey,
		exact: true,
	});

	// Lu dans le cache plutôt que dans l'état React : deux clics rapprochés tombent avant le prochain rendu
	function mutateIfIdle(
		run: (variables: Variables) => void,
		variables: Variables,
	): void {
		const isRunning =
			queryClient.isMutating({
				mutationKey: options.mutationKey,
				exact: true,
			}) > 0;
		if (!isRunning) run(variables);
	}

	const mutation = useMutation({
		mutationKey: options.mutationKey,
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
