import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { authQueryKeys } from "../authQueryKeys";
import { forgetSignedInAccount } from "./forgetSignedInAccount";

describe("forgetSignedInAccount.ts", () => {
	describe("cache", () => {
		it("SHOULD drop every query and mutation of the account WHEN it signs out", () => {
			// Arrange
			const queryClient = new QueryClient();
			queryClient.setQueryData(["gameDeathCounter", "games"], [{ id: 1 }]);
			queryClient.setQueryData(authQueryKeys.sessions(), [{ id: 2 }]);
			queryClient.getMutationCache().build(queryClient, {});

			// Act
			forgetSignedInAccount(queryClient);

			// Assert
			expect(
				queryClient.getQueryData(["gameDeathCounter", "games"]),
			).toBeUndefined();
			expect(
				queryClient.getQueryData(authQueryKeys.sessions()),
			).toBeUndefined();
			expect(queryClient.getMutationCache().getAll()).toHaveLength(0);
		});

		it("SHOULD know nobody is signed in WHEN the account is forgotten", () => {
			// Arrange
			const queryClient = new QueryClient();
			queryClient.setQueryData(authQueryKeys.me(), { username: "alex" });

			// Act
			forgetSignedInAccount(queryClient);

			// Assert
			expect(queryClient.getQueryData(authQueryKeys.me())).toBeNull();
		});
	});
});
