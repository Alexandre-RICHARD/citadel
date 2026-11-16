import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../../backlogQueryKeys";
import type { UserMediaListData } from "./userMediaListData.type";

// La ligne d'un média, dans toutes les vues du tableau en cache ; sans effet là où elle n'est pas chargée
export function updateCachedUserMedia(
	queryClient: QueryClient,
	userMediaId: number,
	update: (userMedia: UserMediaDto) => UserMediaDto,
): void {
	queryClient.setQueriesData<UserMediaListData>(
		{ queryKey: backlogQueryKeys.userMediaLists() },
		(data) =>
			data === undefined
				? undefined
				: {
						...data,
						pages: data.pages.map((page) =>
							page === null
								? null
								: {
										...page,
										userMedia: page.userMedia.map((userMedia) =>
											userMedia.id === userMediaId
												? update(userMedia)
												: userMedia,
										),
									},
						),
					},
	);
}
