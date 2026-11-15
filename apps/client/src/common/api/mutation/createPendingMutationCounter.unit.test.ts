import { hashKey, QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { createPendingMutationCounter } from "./createPendingMutationCounter";

const RENAME_KEY = hashKey(["renameGame", 1]);
const FINISH_KEY = hashKey(["finishGame", 1]);

// Une mutation de la clé donnée, qui reste en cours jusqu'à `finish`
function startMutation(
	queryClient: QueryClient,
	mutationKey: readonly unknown[] | undefined,
) {
	const { promise: response, resolve: finish } = Promise.withResolvers<void>();
	const mutation = queryClient.getMutationCache().build(queryClient, {
		...(mutationKey !== undefined && { mutationKey }),
		mutationFn: async () => response,
	});
	const done = mutation.execute(undefined);
	return {
		finish: async () => {
			finish();
			await done;
		},
	};
}

describe("createPendingMutationCounter.ts", () => {
	describe("counting", () => {
		it("SHOULD count the running mutations of a key WHEN they start", () => {
			// Arrange
			const queryClient = new QueryClient();
			const mutationCache = queryClient.getMutationCache();
			const counter = createPendingMutationCounter(mutationCache);

			// Act
			startMutation(queryClient, ["renameGame", 1]);
			startMutation(queryClient, ["renameGame", 1]);
			startMutation(queryClient, ["finishGame", 1]);

			// Assert
			expect(counter.getCount(RENAME_KEY)).toBe(2);
			expect(counter.getCount(FINISH_KEY)).toBe(1);
		});

		it("SHOULD stop counting a mutation WHEN it ends", async () => {
			// Arrange
			const queryClient = new QueryClient();
			const mutationCache = queryClient.getMutationCache();
			const counter = createPendingMutationCounter(mutationCache);
			const { finish } = startMutation(queryClient, ["renameGame", 1]);

			// Act
			await finish();

			// Assert
			expect(counter.getCount(RENAME_KEY)).toBe(0);
		});

		it("SHOULD stop counting a mutation WHEN the cache is cleared", () => {
			// Arrange
			const queryClient = new QueryClient();
			const mutationCache = queryClient.getMutationCache();
			const counter = createPendingMutationCounter(mutationCache);
			startMutation(queryClient, ["renameGame", 1]);

			// Act
			mutationCache.clear();

			// Assert
			expect(counter.getCount(RENAME_KEY)).toBe(0);
		});

		it("SHOULD count the mutations already running WHEN the counter is created", () => {
			// Arrange
			const queryClient = new QueryClient();
			const mutationCache = queryClient.getMutationCache();
			startMutation(queryClient, ["renameGame", 1]);

			// Act
			const counter = createPendingMutationCounter(mutationCache);

			// Assert
			expect(counter.getCount(RENAME_KEY)).toBe(1);
		});

		it("SHOULD ignore a mutation WHEN it has no key", () => {
			// Arrange
			const queryClient = new QueryClient();
			const mutationCache = queryClient.getMutationCache();
			const counter = createPendingMutationCounter(mutationCache);

			// Act
			startMutation(queryClient, undefined);

			// Assert
			expect(counter.getCount(RENAME_KEY)).toBe(0);
		});
	});

	describe("notifications", () => {
		it("SHOULD notify only the listeners of the key WHEN its count changes", async () => {
			// Arrange
			const queryClient = new QueryClient();
			const mutationCache = queryClient.getMutationCache();
			const counter = createPendingMutationCounter(mutationCache);
			const renameListener = vi.fn();
			const finishListener = vi.fn();
			counter.subscribe(RENAME_KEY, renameListener);
			counter.subscribe(FINISH_KEY, finishListener);

			// Act
			const { finish } = startMutation(queryClient, ["renameGame", 1]);
			await finish();

			// Assert
			expect(renameListener).toHaveBeenCalledTimes(2);
			expect(finishListener).not.toHaveBeenCalled();
		});

		it("SHOULD notify nothing WHEN the listener unsubscribed", () => {
			// Arrange
			const queryClient = new QueryClient();
			const mutationCache = queryClient.getMutationCache();
			const counter = createPendingMutationCounter(mutationCache);
			const listener = vi.fn();
			const unsubscribe = counter.subscribe(RENAME_KEY, listener);

			// Act
			unsubscribe();
			startMutation(queryClient, ["renameGame", 1]);

			// Assert
			expect(listener).not.toHaveBeenCalled();
		});
	});
});
