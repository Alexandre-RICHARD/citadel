import type { ValidateMediaImport } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/validateMediaImport/validateMediaImportEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogQueryKeys } from "../backlogQueryKeys";

/**
 * « Valider » l'aperçu : les médias reconnus entrent au backlog, avec les valeurs par défaut. Plusieurs milliers de lignes
 * ne se construisent pas une à une dans le cache : le tableau se relit à la réponse, l'aperçu se ferme tout de suite
 */
export function useValidateMediaImport() {
	return useOptimisticMutation<ValidateMediaImport, void, null>({
		mutationKey: backlogQueryKeys.mutation("validateMediaImport"),
		actionLabel: "valider l'import",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.BACKLOG}/media-imports/current/validation`,
			method: HttpMethodEnum.POST,
			protected: true,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userMediaLists(),
			backlogQueryKeys.tmdbSearches(),
		],
		applyOptimistic: () => null,
		revertOptimistic: () => undefined,
		applyServerResponse: (queryClient) =>
			queryClient.removeQueries({ queryKey: backlogQueryKeys.mediaImport() }),
		errorReasons: backlogErrorReasons,
	});
}
