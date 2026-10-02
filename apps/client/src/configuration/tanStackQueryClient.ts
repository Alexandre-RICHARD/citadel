import { exponentielInterval } from "@citadel/common/src/universal/interval/exponentielInterval";
import { QueryClient } from "@tanstack/react-query";

export const tanStackQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retryDelay: (attempt: number) => exponentielInterval(2, attempt, 2, 60),
			retry: 1,
		},
	},
});
