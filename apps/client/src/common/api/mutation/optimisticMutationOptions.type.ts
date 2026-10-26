import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type";
import type { MutationKey, QueryClient, QueryKey } from "@tanstack/react-query";

import type { ApiError } from "../error/ApiError";
import type { ErrorReasons } from "../error/errorReasons.type";

export type OptimisticMutationOptions<
	Endpoint extends EndpointModel,
	Variables,
	Rollback,
> = {
	// Une clé par action et par entité, ex. ["gameDeathCounter", "addDeath", bossId] : une seule mutation à la fois par paire
	mutationKey: MutationKey;
	/**
	 * Mutations qui dépendent l'une de l'autre (enregistrer un jeu, puis l'ajouter au backlog) : même scope, leurs requêtes
	 * partent l'une après l'autre. La mise à jour optimiste, elle, s'applique tout de suite
	 */
	scope?: string;
	// Complète « Impossible de … » dans le message d'échec, ex. « ajouter la mort »
	actionLabel: string;
	buildRequest: (variables: Variables) => Endpoint["request"];
	// Lectures touchées : figées avant la mise à jour optimiste, resynchronisées après la mutation
	getAffectedQueryKeys: (variables: Variables) => QueryKey[];
	// Écrit le résultat attendu dans le cache et renvoie de quoi le défaire
	applyOptimistic: (queryClient: QueryClient, variables: Variables) => Rollback;
	// Défait exactement ce qu'a écrit applyOptimistic, sans toucher aux autres mutations en cours
	revertOptimistic: (
		queryClient: QueryClient,
		variables: Variables,
		rollback: Rollback,
	) => void;
	// Remplace la valeur optimiste par la réponse du serveur (vrai id d'une création…)
	applyServerResponse?: (
		queryClient: QueryClient,
		data: Endpoint["response"]["data"],
		variables: Variables,
		rollback: Rollback,
	) => void;
	// Ressource disparue (404 métier) : la retirer des caches au lieu de défaire la mise à jour
	removeGoneResource?: (
		queryClient: QueryClient,
		variables: Variables,
		error: ApiError,
	) => void;
	// Codes métier du projet traduits pour le message d'échec
	errorReasons?: ErrorReasons;
	// Nom de chaque champ du corps, pour détailler un 400 : name → « le nom »
	fieldLabels?: Readonly<Partial<Record<string, string>>>;
};
