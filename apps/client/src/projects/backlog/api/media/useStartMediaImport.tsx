import type { MediaImportDto } from "@citadel/specs/src/projects/backlog/dto/mediaImport/mediaImportDto.type";
import type { StartMediaImportBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/startMediaImport/startMediaImportBodyDto.type";
import type { StartMediaImport } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/startMediaImport/startMediaImportEndpoint.interface";
import { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";

/**
 * Lance l'import d'une liste : la progression s'affiche tout de suite à zéro, puis le serveur lit les fiches sur TMDB à son
 * rythme, sans rien enregistrer avant « Valider »
 */
export function useStartMediaImport() {
	return useOptimisticMutation<StartMediaImport, StartMediaImportBodyDto, null>(
		{
			mutationKey: backlogQueryKeys.mutation("startMediaImport"),
			actionLabel: "lancer l'import",
			buildRequest: (body) => ({
				url: `${ApiPrefixEnum.BACKLOG}/media-imports`,
				method: HttpMethodEnum.POST,
				protected: true,
				body,
			}),
			getAffectedQueryKeys: () => [backlogQueryKeys.mediaImport()],
			getResyncQueryKeys: () => [],
			applyOptimistic: (queryClient, { entries }) => {
				queryClient.setQueryData<MediaImportDto>(
					backlogQueryKeys.mediaImport(),
					{
						status: MediaImportStatusEnum.READING,
						readCount: 0,
						totalCount: entries.length,
						recognized: [],
						rejected: [],
					},
				);
				return null;
			},
			revertOptimistic: (queryClient) =>
				queryClient.removeQueries({ queryKey: backlogQueryKeys.mediaImport() }),
			applyServerResponse: (queryClient, mediaImport) =>
				queryClient.setQueryData(backlogQueryKeys.mediaImport(), mediaImport),
			errorReasons: backlogErrorReasons,
			fieldLabels: backlogFieldLabels,
		},
	);
}
