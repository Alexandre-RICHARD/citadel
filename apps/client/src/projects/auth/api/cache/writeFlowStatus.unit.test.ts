import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { authQueryKeys } from "../authQueryKeys";
import { writeFlowStatus } from "./writeFlowStatus";

const PENDING = {
	flow: {
		kind: FlowKindEnum.MAIL_LOGIN,
		step: FlowStepEnum.MAIL_CODE,
		expiresIn: 900,
		resendRetryAfter: 60,
		remainingAttempts: 5,
		secondFactorMethods: [],
	},
};

function createClientWithMe() {
	const queryClient = new QueryClient();
	queryClient.setQueryData(authQueryKeys.me(), null);
	return queryClient;
}

describe("writeFlowStatus.ts", () => {
	describe("flow cache", () => {
		it("SHOULD keep the answer with its reception time", () => {
			// Arrange
			const queryClient = createClientWithMe();

			// Act
			writeFlowStatus(queryClient, PENDING, 42);

			// Assert
			expect(queryClient.getQueryData(authQueryKeys.flow())).toStrictEqual({
				status: PENDING,
				receivedAt: 42,
			});
		});
	});

	describe("connected account", () => {
		it("SHOULD mark the account as stale WHEN the flow is over", () => {
			// Arrange
			const queryClient = createClientWithMe();

			// Act
			writeFlowStatus(queryClient, { flow: null }, 42);

			// Assert
			expect(queryClient.getQueryState(authQueryKeys.me())?.isInvalidated).toBe(
				true,
			);
		});

		it("SHOULD leave the account alone WHEN the flow goes on", () => {
			// Arrange
			const queryClient = createClientWithMe();

			// Act
			writeFlowStatus(queryClient, PENDING, 42);

			// Assert
			expect(queryClient.getQueryState(authQueryKeys.me())?.isInvalidated).toBe(
				false,
			);
		});
	});
});
