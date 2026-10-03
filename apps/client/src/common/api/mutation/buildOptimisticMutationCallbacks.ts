import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum";
import {
	hashKey,
	type QueryClient,
	type QueryKey,
} from "@tanstack/react-query";

import { ApiError } from "../error/ApiError";
import { buildFailureMessage } from "../error/buildFailureMessage";
import { getErrorReason } from "../error/getErrorReason";
import { isTransientApiError } from "../error/isTransientApiError";
import type { MutationFailure } from "./mutationFailure.type";
import type { OptimisticMutationOptions } from "./optimisticMutationOptions.type";

type Dependencies<Endpoint extends EndpointModel, Variables, Rollback> = {
	queryClient: QueryClient;
	options: OptimisticMutationOptions<Endpoint, Variables, Rollback>;
	notifyFailure: (failure: MutationFailure) => void;
	// Relance la même mutation, depuis le bouton « Réessayer »
	retry: (variables: Variables) => void;
};

// Contexte de la mutation : absent si applyOptimistic a échoué, il n'y a alors rien à défaire
type MutationContext<Rollback> = { rollback: Rollback };

// Lectures dont la resynchronisation attend que plus aucune mutation ne soit en cours
const queryKeysToResync = new WeakMap<QueryClient, QueryKey[]>();

function isGoneResourceError(error: unknown): error is ApiError {
	return (
		error instanceof ApiError &&
		error.status === Number(HttpStatutCodeErrorEnum.NOT_FOUND) &&
		error.code !== TechnicalErrorCodeEnum.ROUTE_NOT_FOUND
	);
}

function getUniqueQueryKeys(queryKeys: QueryKey[]): QueryKey[] {
	return [
		...new Map(
			queryKeys.map((queryKey) => [hashKey(queryKey), queryKey]),
		).values(),
	];
}

// Callbacks de useMutation, sans React : testables avec un simple QueryClient
export function buildOptimisticMutationCallbacks<
	Endpoint extends EndpointModel,
	Variables,
	Rollback,
>({
	queryClient,
	options,
	notifyFailure,
	retry,
}: Dependencies<Endpoint, Variables, Rollback>) {
	return {
		async onMutate(variables: Variables): Promise<MutationContext<Rollback>> {
			// Une lecture en vol écraserait la valeur optimiste à son arrivée
			await Promise.all(
				options
					.getAffectedQueryKeys(variables)
					.map((queryKey) => queryClient.cancelQueries({ queryKey })),
			);
			return { rollback: options.applyOptimistic(queryClient, variables) };
		},

		onError(
			error: unknown,
			variables: Variables,
			context: MutationContext<Rollback> | undefined,
		): void {
			if (isGoneResourceError(error) && options.removeGoneResource)
				options.removeGoneResource(queryClient, variables, error);
			else if (context)
				options.revertOptimistic(queryClient, variables, context.rollback);

			// Une réponse en erreur est gérée par le toast ; une autre erreur est un bug, qui doit rester visible
			if (!(error instanceof ApiError)) console.error(error);

			const reason = getErrorReason(error, {
				...(options.errorReasons && { projectReasons: options.errorReasons }),
				...(options.fieldLabels && { fieldLabels: options.fieldLabels }),
			});
			notifyFailure({
				message: buildFailureMessage(options.actionLabel, reason),
				...(isTransientApiError(error) && { retry: () => retry(variables) }),
			});
		},

		onSuccess(
			data: Endpoint["response"]["data"],
			variables: Variables,
			context: MutationContext<Rollback>,
		): void {
			options.applyServerResponse?.(
				queryClient,
				data,
				variables,
				context.rollback,
			);
		},

		// Le serveur reste la source de vérité des valeurs calculées (totaux, dates, ordre)
		onSettled(_data: unknown, _error: unknown, variables: Variables): void {
			const queryKeys = getUniqueQueryKeys([
				...(queryKeysToResync.get(queryClient) ?? []),
				...options.getAffectedQueryKeys(variables),
			]);

			// La mutation qui se termine compte encore parmi celles en cours. S'il en reste une autre,
			// on attend : un refetch maintenant effacerait sa valeur optimiste
			if (queryClient.isMutating() > 1) {
				queryKeysToResync.set(queryClient, queryKeys);
				return;
			}

			queryKeysToResync.delete(queryClient);
			queryKeys.forEach((queryKey) => {
				void queryClient.invalidateQueries({ queryKey });
			});
		},
	};
}
