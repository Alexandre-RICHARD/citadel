import type { MediaImportDto } from "@citadel/specs/src/projects/backlog/dto/mediaImport/mediaImportDto.type";
import type { CancelMediaImport } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/cancelMediaImport/cancelMediaImportEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogQueryKeys } from "../backlogQueryKeys";

// L'import tel qu'il était, pour le remettre si l'annulation échoue
type Rollback = MediaImportDto | undefined;

// Annuler l'import en cours : rien n'a été enregistré, l'aperçu disparaît tout de suite
export function useCancelMediaImport() {
	return useOptimisticMutation<CancelMediaImport, void, Rollback>({
		mutationKey: backlogQueryKeys.mutation("cancelMediaImport"),
		actionLabel: "annuler l'import",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.BACKLOG}/media-imports/current`,
			method: HttpMethodEnum.DELETE,
			protected: true,
		}),
		getAffectedQueryKeys: () => [],
		applyOptimistic: (queryClient) => {
			const current = queryClient.getQueryData<MediaImportDto>(
				backlogQueryKeys.mediaImport(),
			);
			queryClient.removeQueries({ queryKey: backlogQueryKeys.mediaImport() });
			return current;
		},
		revertOptimistic: (queryClient, _variables, previous) => {
			if (previous !== undefined)
				queryClient.setQueryData(backlogQueryKeys.mediaImport(), previous);
		},
		// L'import n'existait plus (fini ou perdu au redémarrage) : il n'y a rien à remettre
		removeGoneResource: () => undefined,
		errorReasons: backlogErrorReasons,
	});
}
