import type { GetMediaImport } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/getMediaImport/getMediaImportEndpoint.interface";
import { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromMediaImportDtoToMediaImportFm } from "../model/media/fromMediaImportDtoToMediaImportFm";
import type { MediaImportFm } from "../model/media/mediaImportFm.type";

// Pendant la lecture, la progression se relit chaque seconde ; elle s'arrête à l'aperçu ou à l'échec
const POLL_INTERVAL_MS = 1000;

type MediaImport = {
	// undefined tant que rien n'est lu, ou sans import lancé
	data: MediaImportFm | undefined;
	error: ApiError | null;
};

/**
 * L'import en cours du compte, suivi jusqu'à son aperçu. `isStarted` : un import vient d'être lancé, ou l'était déjà ; sans
 * cela, rien ne se lit. Seule la modale d'import l'interroge, et seulement pendant la lecture
 */
export function useMediaImport(isStarted: boolean): MediaImport {
	const mediaImport = useQuery({
		queryKey: backlogQueryKeys.mediaImport(),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetMediaImport>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/media-imports/current`,
						method: HttpMethodEnum.GET,
						protected: true,
					},
					{ signal },
				)
			).data,
		enabled: isStarted,
		refetchInterval: (query) =>
			query.state.data?.status === MediaImportStatusEnum.READING
				? POLL_INTERVAL_MS
				: false,
		select: fromMediaImportDtoToMediaImportFm,
	});
	return {
		data: mediaImport.data,
		error: mediaImport.error as ApiError | null,
	};
}
