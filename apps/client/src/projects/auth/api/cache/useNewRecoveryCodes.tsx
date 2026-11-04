import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "../authQueryKeys";

/**
 * Les codes de secours à montrer, jamais relus du serveur ; null : aucun à montrer. `acknowledge` les efface, une fois
 * sauvegardés : ils ne reviendront plus
 */
export function useNewRecoveryCodes() {
	const queryClient = useQueryClient();
	const { data } = useQuery<string[] | null>({
		queryKey: authQueryKeys.newRecoveryCodes(),
		queryFn: () => null,
		enabled: false,
		staleTime: Infinity,
		gcTime: Infinity,
	});

	return {
		recoveryCodes: data ?? null,
		acknowledge: () => {
			queryClient.setQueryData<string[] | null>(
				authQueryKeys.newRecoveryCodes(),
				null,
			);
		},
	};
}
