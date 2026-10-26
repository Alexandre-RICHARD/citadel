import type { QueryKey } from "@tanstack/react-query";

// Place d'une ligne retirée d'une vue du tableau, pour l'y remettre si le serveur refuse
export type RemovedUserGamePosition = {
	queryKey: QueryKey;
	pageIndex: number;
	index: number;
};
