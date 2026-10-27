import type { QueryClient, QueryKey } from "@tanstack/react-query";

// Transforme une donnée déjà en cache ; une lecture jamais faite reste absente : un cache ne se crée pas de toutes pièces
export function updateCachedQueryData<Data>(
	queryClient: QueryClient,
	queryKey: QueryKey,
	update: (data: Data) => Data,
): void {
	queryClient.setQueryData<Data>(queryKey, (data) =>
		data === undefined ? undefined : update(data),
	);
}
