import type { QueryClient } from "@tanstack/react-query";

import type { StoredGameListData } from "./storedGameListData.type";
import type { StoredGameListSnapshot } from "./storedGameListSnapshot.type";

// Remet les listes d'avant le retrait, opération inverse de removeCachedStoredGame
export function restoreCachedStoredGame(
	queryClient: QueryClient,
	snapshots: StoredGameListSnapshot[],
): void {
	for (const { queryKey, data } of snapshots)
		queryClient.setQueryData<StoredGameListData>(queryKey, data);
}
