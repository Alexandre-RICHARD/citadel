import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum";
import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum";
import { describe, expect, it } from "vitest";

import { fromReceivedFlowStatusToFlowFm } from "./fromReceivedFlowStatusToFlowFm";

const RECEIVED_AT = 1_000_000;

describe("fromReceivedFlowStatusToFlowFm.ts", () => {
	describe("flow in progress", () => {
		it("SHOULD turn the seconds left into deadlines from the reception time", () => {
			expect(
				fromReceivedFlowStatusToFlowFm({
					status: {
						flow: {
							kind: FlowKindEnum.REGISTRATION,
							step: FlowStepEnum.MAIL_CODE,
							expiresIn: 1800,
							resendRetryAfter: 60,
							remainingAttempts: 4,
							secondFactorMethods: [],
						},
					},
					receivedAt: RECEIVED_AT,
				}),
			).toStrictEqual({
				kind: FlowKindEnum.REGISTRATION,
				step: FlowStepEnum.MAIL_CODE,
				expiresAt: RECEIVED_AT + 1_800_000,
				resendAvailableAt: RECEIVED_AT + 60_000,
				remainingAttempts: 4,
				secondFactorMethods: [],
			});
		});

		it("SHOULD give no resend deadline WHEN the server announces no wait", () => {
			expect(
				fromReceivedFlowStatusToFlowFm({
					status: {
						flow: {
							kind: FlowKindEnum.LOGIN,
							step: FlowStepEnum.SECOND_FACTOR,
							expiresIn: 600,
							resendRetryAfter: null,
							remainingAttempts: 5,
							secondFactorMethods: [],
						},
					},
					receivedAt: RECEIVED_AT,
				})?.resendAvailableAt,
			).toBeNull();
		});
	});

	describe("second factor", () => {
		it("SHOULD keep what the account can give WHEN the flow waits for its second factor", () => {
			expect(
				fromReceivedFlowStatusToFlowFm({
					status: {
						flow: {
							kind: FlowKindEnum.LOGIN,
							step: FlowStepEnum.SECOND_FACTOR,
							expiresIn: 600,
							resendRetryAfter: null,
							remainingAttempts: 5,
							secondFactorMethods: [
								SecondFactorMethodEnum.TOTP,
								SecondFactorMethodEnum.RECOVERY_CODE,
							],
						},
					},
					receivedAt: RECEIVED_AT,
				})?.secondFactorMethods,
			).toStrictEqual([
				SecondFactorMethodEnum.TOTP,
				SecondFactorMethodEnum.RECOVERY_CODE,
			]);
		});
	});

	describe("no flow", () => {
		it("SHOULD give null WHEN the browser has no flow", () => {
			expect(
				fromReceivedFlowStatusToFlowFm({
					status: { flow: null },
					receivedAt: RECEIVED_AT,
				}),
			).toBeNull();
		});
	});
});
