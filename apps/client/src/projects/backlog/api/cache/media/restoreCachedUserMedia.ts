import { insertAt } from "@citadel/common/src/universal/array/insertAt";
import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import type { QueryClient } from "@tanstack/react-query";

import type { RemovedUserGamePosition } from "../removedUserGamePosition.type";
import { shiftMediaListCounts } from "./shiftMediaListCounts";
import type { UserMediaListData } from "./userMediaListData.type";

// Remet une ligne retirée à ses places, opération inverse de removeCachedUserMedia
export function restoreCachedUserMedia(
	queryClient: QueryClient,
	userMedia: UserMediaDto,
	positions: RemovedUserGamePosition[],
): void {
	for (const { queryKey, pageIndex, index } of positions)
		queryClient.setQueryData<UserMediaListData>(queryKey, (data) =>
			data === undefined
				? undefined
				: {
						...data,
						pages: data.pages.map((page, currentIndex) =>
							page === null
								? null
								: {
										...page,
										...shiftMediaListCounts(page, userMedia.mediaType, 1),
										userMedia:
											currentIndex === pageIndex
												? insertAt(page.userMedia, index, userMedia)
												: page.userMedia,
									},
						),
					},
		);
}
