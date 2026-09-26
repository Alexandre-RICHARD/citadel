import { QueryClient } from "@tanstack/react-query";

import { exponentielInterval } from "../common/helpers/interval/exponentielInterval";

export const tanStackQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retryDelay: (attempt: number) => exponentielInterval(2, attempt, 2, 60),
			retry: 1,
		},
	},
});
