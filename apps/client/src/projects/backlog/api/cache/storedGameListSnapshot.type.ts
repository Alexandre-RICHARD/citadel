import type { QueryKey } from "@tanstack/react-query";

import type { StoredGameListData } from "./storedGameListData.type";

// Une liste telle qu'elle était avant le retrait d'un jeu
export type StoredGameListSnapshot = {
	queryKey: QueryKey;
	data: StoredGameListData;
};
