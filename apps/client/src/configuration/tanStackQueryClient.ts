import { exponentialInterval } from "@citadel/common/src/universal/interval/exponentialInterval";
import { QueryClient } from "@tanstack/react-query";

export const tanStackQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retryDelay: (attempt: number) => exponentialInterval(2, attempt, 2, 60),
			retry: 1,
		},
	},
});
