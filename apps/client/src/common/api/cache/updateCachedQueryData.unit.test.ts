import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { updateCachedQueryData } from "./updateCachedQueryData";

const QUERY_KEY = ["test", "counter"];

describe("updateCachedQueryData.ts", () => {
	describe("cached data", () => {
		it("SHOULD replace the data with the result of update", () => {
			const queryClient = new QueryClient();
			queryClient.setQueryData(QUERY_KEY, { count: 1 });

			updateCachedQueryData<{ count: number }>(
				queryClient,
				QUERY_KEY,
				({ count }) => ({ count: count + 1 }),
			);

			expect(queryClient.getQueryData(QUERY_KEY)).toStrictEqual({ count: 2 });
		});
	});

	describe("missing data", () => {
		it("SHOULD leave the cache empty WHEN the query was never read", () => {
			const queryClient = new QueryClient();

			updateCachedQueryData<{ count: number }>(
				queryClient,
				QUERY_KEY,
				({ count }) => ({ count: count + 1 }),
			);

			expect(queryClient.getQueryData(QUERY_KEY)).toBeUndefined();
		});
	});
});
