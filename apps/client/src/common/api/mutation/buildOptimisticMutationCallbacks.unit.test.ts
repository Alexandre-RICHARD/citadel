import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { QueryClient, type QueryKey } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "../error/ApiError";
import { buildOptimisticMutationCallbacks } from "./buildOptimisticMutationCallbacks";
import type { MutationFailure } from "./mutationFailure.type";
import type { OptimisticMutationOptions } from "./optimisticMutationOptions.type";

type Game = { name: string };
type Variables = { name: string };
type Rollback = { previousName: string };

const GAME_KEY = ["games", 1];
const VARIABLES = { name: "Hades II" };

const REMOVE_GAME = {
	removeGoneResource: (client: QueryClient) => {
		client.removeQueries({ queryKey: GAME_KEY });
	},
};

function setup(
	overrides: Partial<
		OptimisticMutationOptions<EndpointModel, Variables, Rollback>
	> = {},
) {
	const queryClient = new QueryClient();
	queryClient.setQueryData<Game>(GAME_KEY, { name: "Hades" });
	const notifyFailure = vi.fn<(failure: MutationFailure) => void>();
	const retry = vi.fn<(variables: Variables) => void>();
	const options: OptimisticMutationOptions<EndpointModel, Variables, Rollback> =
		{
			mutationKey: ["renameGame", 1],
			actionLabel: "renommer le jeu",
			buildRequest: () => ({
				url: "/games/1",
				method: HttpMethodEnum.PUT,
				protected: false,
			}),
			getAffectedQueryKeys: () => [GAME_KEY],
			applyOptimistic: (client, { name }) => {
				const previousName = client.getQueryData<Game>(GAME_KEY)?.name ?? "";
				client.setQueryData<Game>(GAME_KEY, { name });
				return { previousName };
			},
			revertOptimistic: (client, _variables, { previousName }) => {
				client.setQueryData<Game>(GAME_KEY, { name: previousName });
			},
			errorReasons: { GAME_NOT_FOUND: "ce jeu n'existe plus" },
			...overrides,
		};
	const callbacks = buildOptimisticMutationCallbacks({
		queryClient,
		options,
		notifyFailure,
		retry,
	});
	return { queryClient, notifyFailure, retry, callbacks };
}

// Échoue après l'écriture optimiste, comme une vraie mutation refusée par le serveur
async function failAfterOptimisticWrite(
	error: unknown,
	overrides?: Partial<
		OptimisticMutationOptions<EndpointModel, Variables, Rollback>
	>,
) {
	const context = setup(overrides);
	const mutationContext = await context.callbacks.onMutate(VARIABLES);
	context.callbacks.onError(error, VARIABLES, mutationContext);
	return context;
}

describe("buildOptimisticMutationCallbacks.ts", () => {
	describe("before the request", () => {
		it("SHOULD write the expected value in the cache and keep how to undo it", async () => {
			// Arrange
			const { queryClient, callbacks } = setup();

			// Act
			const context = await callbacks.onMutate(VARIABLES);

			// Assert
			expect(queryClient.getQueryData(GAME_KEY)).toStrictEqual({
				name: "Hades II",
			});
			expect(context).toStrictEqual({ rollback: { previousName: "Hades" } });
		});

		it("SHOULD cancel the reads in flight on the affected queries", async () => {
			// Arrange
			const { queryClient, callbacks } = setup();
			const cancelQueries = vi.spyOn(queryClient, "cancelQueries");

			// Act
			await callbacks.onMutate(VARIABLES);

			// Assert
			expect(cancelQueries).toHaveBeenCalledWith({ queryKey: GAME_KEY });
		});
	});

	describe("successful mutations", () => {
		it("SHOULD hand the server response to applyServerResponse", async () => {
			// Arrange
			const applyServerResponse = vi.fn();
			const { queryClient, callbacks } = setup({ applyServerResponse });
			const context = await callbacks.onMutate(VARIABLES);
			const data = { id: 1, name: "Hades II" };

			// Act
			callbacks.onSuccess(data, VARIABLES, context);

			// Assert
			expect(applyServerResponse).toHaveBeenCalledWith(
				queryClient,
				data,
				VARIABLES,
				{ previousName: "Hades" },
			);
		});
	});

	describe("failed mutations", () => {
		it("SHOULD undo the optimistic value and offer to retry WHEN the failure is transient", async () => {
			// Act
			const { queryClient, notifyFailure, retry } =
				await failAfterOptimisticWrite(
					new ApiError({ status: null, code: null }),
				);

			// Assert
			expect(queryClient.getQueryData(GAME_KEY)).toStrictEqual({
				name: "Hades",
			});
			expect(notifyFailure).toHaveBeenCalledWith({
				message: "Impossible de renommer le jeu : le serveur est injoignable.",
				retry: expect.any(Function) as () => void,
			});
			notifyFailure.mock.calls[0]?.[0].retry?.();
			expect(retry).toHaveBeenCalledWith(VARIABLES);
		});

		it("SHOULD undo the optimistic value without retry WHEN the API refuses the input", async () => {
			// Act
			const { queryClient, notifyFailure } = await failAfterOptimisticWrite(
				new ApiError({
					status: 400,
					code: TechnicalErrorCodeEnum.VALIDATION_FAILED,
				}),
			);

			// Assert
			expect(queryClient.getQueryData(GAME_KEY)).toStrictEqual({
				name: "Hades",
			});
			expect(notifyFailure).toHaveBeenCalledWith({
				message: "Impossible de renommer le jeu : la saisie a été refusée.",
			});
		});

		it("SHOULD remove the resource instead of undoing WHEN it no longer exists", async () => {
			// Act
			const { queryClient, notifyFailure } = await failAfterOptimisticWrite(
				new ApiError({ status: 404, code: "GAME_NOT_FOUND" }),
				REMOVE_GAME,
			);

			// Assert
			expect(queryClient.getQueryData(GAME_KEY)).toBeUndefined();
			expect(notifyFailure).toHaveBeenCalledWith({
				message: "Impossible de renommer le jeu : ce jeu n'existe plus.",
			});
		});

		it("SHOULD undo the optimistic value WHEN the route itself is not found", async () => {
			// Act
			const { queryClient } = await failAfterOptimisticWrite(
				new ApiError({
					status: 404,
					code: TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
				}),
				REMOVE_GAME,
			);

			// Assert
			expect(queryClient.getQueryData(GAME_KEY)).toStrictEqual({
				name: "Hades",
			});
		});

		it("SHOULD undo the optimistic value WHEN the project cannot remove a gone resource", async () => {
			// Act
			const { queryClient } = await failAfterOptimisticWrite(
				new ApiError({ status: 404, code: "GAME_NOT_FOUND" }),
			);

			// Assert
			expect(queryClient.getQueryData(GAME_KEY)).toStrictEqual({
				name: "Hades",
			});
		});

		it("SHOULD log the bug in the console WHEN the error does not come from the API", async () => {
			// Arrange
			const bug = new TypeError("x is undefined");
			const consoleError = vi
				.spyOn(console, "error")
				.mockImplementation(() => undefined);

			// Act
			const { queryClient, notifyFailure } =
				await failAfterOptimisticWrite(bug);

			// Assert
			expect(consoleError).toHaveBeenCalledWith(bug);
			expect(queryClient.getQueryData(GAME_KEY)).toStrictEqual({
				name: "Hades",
			});
			expect(notifyFailure).toHaveBeenCalledWith({
				message:
					"Impossible de renommer le jeu : une erreur inattendue est survenue.",
			});
			consoleError.mockRestore();
		});

		it("SHOULD log nothing in the console WHEN the API answered with an error", async () => {
			// Arrange
			const consoleError = vi.spyOn(console, "error");

			// Act
			await failAfterOptimisticWrite(new ApiError({ status: 500, code: null }));

			// Assert
			expect(consoleError).not.toHaveBeenCalled();
			consoleError.mockRestore();
		});

		it("SHOULD undo nothing WHEN the optimistic write itself failed", () => {
			// Arrange
			const revertOptimistic = vi.fn();
			const { notifyFailure, callbacks } = setup({ revertOptimistic });

			// Act : sans contexte, comme quand onMutate a levé une erreur
			callbacks.onError(
				new ApiError({ status: null, code: null }),
				VARIABLES,
				undefined,
			);

			// Assert
			expect(revertOptimistic).not.toHaveBeenCalled();
			expect(notifyFailure).toHaveBeenCalledOnce();
		});
	});

	describe("resynchronization", () => {
		it("SHOULD invalidate the affected queries WHEN no other mutation is running", () => {
			// Arrange : la mutation qui se termine compte encore parmi celles en cours
			const { queryClient, callbacks } = setup();
			vi.spyOn(queryClient, "isMutating").mockReturnValue(1);
			const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

			// Act
			callbacks.onSettled(undefined, null, VARIABLES);

			// Assert
			expect(invalidateQueries).toHaveBeenCalledExactlyOnceWith({
				queryKey: GAME_KEY,
			});
		});

		it("SHOULD wait for the last running mutation, then invalidate the queries of both", () => {
			// Arrange
			const listKey: QueryKey = ["games"];
			const first = setup();
			const second = buildOptimisticMutationCallbacks({
				queryClient: first.queryClient,
				options: {
					mutationKey: ["finishGame", 2],
					actionLabel: "terminer le jeu",
					buildRequest: () => ({
						url: "/games/2/finished",
						method: HttpMethodEnum.PATCH,
						protected: false,
					}),
					getAffectedQueryKeys: () => [listKey],
					applyOptimistic: () => undefined,
					revertOptimistic: () => undefined,
				},
				notifyFailure: vi.fn(),
				retry: vi.fn(),
			});
			const isMutating = vi.spyOn(first.queryClient, "isMutating");
			const invalidateQueries = vi.spyOn(
				first.queryClient,
				"invalidateQueries",
			);

			// Act
			isMutating.mockReturnValue(2);
			first.callbacks.onSettled(undefined, null, VARIABLES);
			const invalidatedWhileRunning = invalidateQueries.mock.calls.length;
			isMutating.mockReturnValue(1);
			second.onSettled(undefined, null, VARIABLES);

			// Assert
			expect(invalidatedWhileRunning).toBe(0);
			expect(invalidateQueries.mock.calls).toStrictEqual([
				[{ queryKey: GAME_KEY }],
				[{ queryKey: listKey }],
			]);
		});

		it("SHOULD invalidate each query once WHEN several mutations touched it", () => {
			// Arrange
			const { queryClient, callbacks } = setup();
			const isMutating = vi.spyOn(queryClient, "isMutating");
			const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

			// Act
			isMutating.mockReturnValue(2);
			callbacks.onSettled(undefined, null, VARIABLES);
			isMutating.mockReturnValue(1);
			callbacks.onSettled(undefined, null, VARIABLES);

			// Assert
			expect(invalidateQueries).toHaveBeenCalledExactlyOnceWith({
				queryKey: GAME_KEY,
			});
		});
	});
});
