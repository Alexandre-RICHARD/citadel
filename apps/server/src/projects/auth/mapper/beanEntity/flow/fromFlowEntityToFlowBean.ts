import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";

import type { FlowBean } from "../../../bean/flowBean.type.ts";
import type { Flow } from "../../../models/Flow.ts";

type CodeSettings = {
	maxAttempts: number;
	resendDelayMs: number;
};

// Un leurre se lit comme un vrai parcours : mêmes dates, mêmes essais, rien de son compte
export function fromFlowEntityToFlowBean(
	flow: Pick<Flow, "kind" | "step" | "expiresAt" | "lastSentAt" | "attempts">,
	{ maxAttempts, resendDelayMs }: CodeSettings,
): FlowBean {
	const resendAvailableAt =
		flow.step === FlowStepEnum.MAIL_CODE && flow.lastSentAt !== null
			? new Date(flow.lastSentAt.getTime() + resendDelayMs)
			: null;
	return {
		kind: flow.kind,
		step: flow.step,
		expiresAt: flow.expiresAt,
		resendAvailableAt,
		remainingAttempts: Math.max(0, maxAttempts - flow.attempts),
	};
}
