import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { describe, expect, it } from "vitest";

import type { FlowBean } from "../../../bean/flowBean.type.ts";
import { fromFlowBeanToFlowDto } from "./fromFlowBeanToFlowDto.ts";

const NOW = new Date("2026-11-02T10:00:00.000Z");

function secondsLater(seconds: number): Date {
	return new Date(NOW.getTime() + seconds * 1000);
}

function buildFlow(overrides: Partial<FlowBean> = {}): FlowBean {
	return {
		kind: FlowKindEnum.REGISTRATION,
		step: FlowStepEnum.MAIL_CODE,
		expiresAt: secondsLater(1800),
		resendAvailableAt: secondsLater(60),
		remainingAttempts: 5,
		...overrides,
	};
}

describe("fromFlowBeanToFlowDto.ts", () => {
	describe("durations", () => {
		it("SHOULD give the seconds left before the end and before a resend", () => {
			expect(fromFlowBeanToFlowDto(buildFlow(), NOW)).toStrictEqual({
				kind: FlowKindEnum.REGISTRATION,
				step: FlowStepEnum.MAIL_CODE,
				expiresIn: 1800,
				resendRetryAfter: 60,
				remainingAttempts: 5,
			});
		});

		it("SHOULD round a started second up", () => {
			expect(
				fromFlowBeanToFlowDto(buildFlow({ expiresAt: secondsLater(0.2) }), NOW)
					.expiresIn,
			).toBe(1);
		});

		it("SHOULD give 0 WHEN the flow is already over", () => {
			expect(
				fromFlowBeanToFlowDto(buildFlow({ expiresAt: secondsLater(-3) }), NOW)
					.expiresIn,
			).toBe(0);
		});
	});

	describe("resend", () => {
		it.each([
			{ reason: "the delay is over", resendAvailableAt: secondsLater(-1) },
			{ reason: "the delay ends right now", resendAvailableAt: NOW },
			{ reason: "the step sends no mail", resendAvailableAt: null },
		])("SHOULD give no wait WHEN $reason", ({ resendAvailableAt }) => {
			expect(
				fromFlowBeanToFlowDto(buildFlow({ resendAvailableAt }), NOW)
					.resendRetryAfter,
			).toBeNull();
		});
	});
});
